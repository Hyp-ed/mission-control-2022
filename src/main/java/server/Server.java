package server;

import java.io.IOException;
import java.net.*;
import java.nio.ByteBuffer;
import telemetrydata.TelemetryData.*;
import org.springframework.stereotype.Service;
import org.json.*;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.ExecutionException;

@Service
public class Server implements Runnable {
    private static final int PORT = 9090;
    private static final int SPACE_X_PORT = 3000;
    private static final String SPACE_X_IP = "localhost"; // change to actual ip
    private static final byte teamID = 11; // given to us by SpaceX

    private Socket client; // TCP socket to pod
    private DatagramSocket spaceXSocket; // UDP socket to SpaceX
    private InetAddress spaceXAddress;

    private ClientToServer msgFromClient;
    private boolean connected;

    public Server() {
        try {
            spaceXSocket = new DatagramSocket();
            spaceXAddress = InetAddress.getByName(SPACE_X_IP);
            System.out.println("SPACEX ADDRESS: " + spaceXAddress);
        }
        catch (SocketException e) {
            System.out.println("SpaceX socket initialization failed");
        }
        catch (UnknownHostException e) {
            System.out.println("Couldn't resolve SpaceX hostname");
        }
    }

    @Override
    public void run() {
        ServerSocket listener = getServerSocket(PORT);
        System.out.println("Server now listening on port " + PORT);
        System.out.println("Waiting to connect to client...");

        try {
            client = getClientServerFromListener(listener);
            connected = true;
            System.out.println("Connected to client");

            Thread readWorker = new Thread(new MessageReader());
            Thread udpWorker = new Thread(new SpaceXSender());

            readWorker.start();
            udpWorker.start();

            try {
                readWorker.join();
                udpWorker.join();
            }
            catch (InterruptedException e) {
                System.out.println("Problem joining readWorker/udpWorker threads");
            }

            closeClient(client);
        }
        finally  {
            closeServer(listener);
        }
    }

    public void sendMessage(JSONObject message) {
        try {
            Thread sendWorker = new Thread(new MessageSender(message));
            sendWorker.start();
            sendWorker.join();
        }
        catch (InterruptedException e) {
            System.out.println("Problem joining sendWorker thread");
        }
        catch (NullPointerException e) {
            System.out.println("Could not send message, client probably not running");
        }
    }

    private class MessageSender implements Runnable {
        private ServerToClient.Builder msgBuilder;

        public MessageSender(JSONObject msg) {
            // TODO: check for null from json? / throw exception if this fails??
            msgBuilder = ServerToClient.newBuilder().setCommand(ServerToClient.Command.valueOf(msg.getString("command").toUpperCase()));
        }

        @Override
        public void run() {
            try {
                ServerToClient msg = msgBuilder.build();
                msg.writeDelimitedTo(Server.this.client.getOutputStream());
                System.out.println("Sent \"" + msg.getCommand() + "\" to client");
            }
            catch (IOException e) {
                System.out.println("Error sending message to client");
            }
        }
    }

    private class MessageReader implements Runnable {

        @Override
        public void run() {
            ExecutorService executor = Executors.newSingleThreadExecutor();

            while (true) {
                Future<ClientToServer> futureMsg = executor.submit(new Callable() {
                    @Override
                    public ClientToServer call() throws Exception {
                        try {
                            return ClientToServer.parseDelimitedFrom(Server.this.client.getInputStream());
                        }
                        catch (IOException e) {
                            System.out.println("IO Exception: " + e);
                            throw new RuntimeException("Failed getting input stream");
                        }
                    }
                });

                try {
                    Server.this.msgFromClient = futureMsg.get(3000, TimeUnit.MILLISECONDS);

                    if (Server.this.msgFromClient == null) {
                        throw new NullPointerException();
                    }
                }
                catch (TimeoutException e) {
                    futureMsg.cancel(true);
                    System.out.println("Client did not send message back in time, may be disconnected");
                    connected = false;
                    break;
                }
                catch (InterruptedException | ExecutionException e) {
                    System.out.println("Execution of futureMsg was interrupted");
                    connected = false;
                    break;
                }
                catch (NullPointerException e) {
                    System.out.println("Client probably disconnected");
                    connected = false;
                    break;
                }

                // executor.shutdownNow();
            }
        }
    }

    private class SpaceXSender implements Runnable {
        private ByteBuffer buffer;
        private byte status;
        private int acceleration;
        private int position;
        private int velocity;

        public SpaceXSender() {
            buffer = ByteBuffer.allocate(34); // 34 bytes as specified by SpaceX
        }

        @Override
        public void run() {
            while (connected) {
                if (msgFromClient != null) {  // receiving messages from pod
                    switch (msgFromClient.getStateMachine().getCurrentState()) {
                        case INVALID:
                            System.out.println("Shouldn't receive this state");
                            break;
                        case EMERGENCY_BRAKING:
                        case FAILURE_STOPPED:
                            status = 0; // Fault
                            break;
                        case IDLE:
                        case CALIBRATING:
                        case RUN_COMPLETE:
                        case FINISHED:
                            status = 1; // Safe to approach
                            break;
                        case READY:
                            status = 2; // Ready to launch
                            break;
                        case ACCELERATING:
                            status = 3; // Launching
                            break;
                        case NOMINAL_BRAKING:
                            status = 5; // Braking
                            break;
                        case EXITING:
                            status = 6; // Crawling
                            break;
                        default:
                            status = 0; // Default to fault
                    }

                    acceleration = Math.round(msgFromClient.getNavigation().getAcceleration() * 100);  // times 100 for m/s^2 to cm/s^2
                    position = Math.round(msgFromClient.getNavigation().getDistance() * 100);  // times 100 for m to cm
                    velocity = Math.round(msgFromClient.getNavigation().getVelocity() * 100);  // times 100 for m/s to cm/s

                    buffer.put(teamID);
                    buffer.put(status);
                    buffer.putInt(acceleration);  // acceleration
                    buffer.putInt(position);  // position
                    buffer.putInt(velocity);  // velocity
                    buffer.putInt(0);  // battery voltage (optional, set to 0)
                    buffer.putInt(0);  // battery current (optional, set to 0)
                    buffer.putInt(0);  // battery temp (optional, set to 0)
                    buffer.putInt(0);  // pod temp (optional, set to 0)
                    buffer.putInt(0);  // stripe count (optional, set to 0)

                    byte[] bufferArray = buffer.array();
                    DatagramPacket packet = new DatagramPacket(bufferArray, bufferArray.length, spaceXAddress, SPACE_X_PORT);

                    try {
                        spaceXSocket.send(packet);
                    }
                    catch (IOException e) {
                        System.out.println("Failure sending to SpaceX socket");
                    }

                    buffer.clear();
                }

                try {
                    Thread.sleep(30);
                }
                catch (InterruptedException e) {
                    System.out.println("Error putting thread to sleep while sending to SpaceX");
                }
            }

            // // we've disconnected, send one final frame to SpaceX
            buffer.clear();

            status = 0;

            buffer.put(teamID);
            buffer.put(status);  // PUT INTO FAULT STATE
            buffer.putInt(0);  // acceleration
            buffer.putInt(0);  // position
            buffer.putInt(0);  // velocity
            buffer.putInt(0);  // battery voltage (optional, set to 0)
            buffer.putInt(0);  // battery current (optional, set to 0)
            buffer.putInt(0);  // battery temp (optional, set to 0)
            buffer.putInt(0);  // pod temp (optional, set to 0)
            buffer.putInt(0);  // stripe count (optional, set to 0)

            byte[] bufferArray = buffer.array();
            DatagramPacket packet = new DatagramPacket(bufferArray, bufferArray.length, spaceXAddress, SPACE_X_PORT);

            try {
                spaceXSocket.send(packet);
            }
            catch (IOException e) {
                System.out.println("Failure sending to SpaceX socket");
            }
        }
    }

    private static ServerSocket getServerSocket(int portNum) {
        try {
            return new ServerSocket(portNum);
        }
        catch (IOException e) {
            throw new RuntimeException("Failed to get new server socket");
        }
    }

    private static Socket getClientServerFromListener(ServerSocket lstn) {
        try {
            return lstn.accept();
        }
        catch (IOException e) {
            throw new RuntimeException("Failed to get new client socket");
        }
    }

    private static void closeClient(Socket clientSocket) {
        try {
            clientSocket.close();
        }
        catch (IOException e) {
            throw new RuntimeException("Error closing client socket");
        }
    }

    private static void closeServer(ServerSocket serverSocket) {
        try {
            serverSocket.close();
        }
        catch (IOException e) {
            throw new RuntimeException("Error closing server socket");
        }
    }

    public ClientToServer getProtoMessage() {
        return msgFromClient;
    }

    public boolean isConnected() {
        return connected;
    }
}
