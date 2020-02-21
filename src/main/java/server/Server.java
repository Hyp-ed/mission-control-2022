package server;

import java.io.*;
import java.net.*;
import java.nio.*;
import org.json.*;
import org.springframework.stereotype.Service;

@Service
public class Server implements Runnable {
  private static final int PORT = 9090;

  private Socket client; // TCP socket to pod

  private JSONObject msgFromClient;
  private boolean connected = false;

  // SpaceX
  private static final byte teamID = 11; // given to us by SpaceX
  private static final int SPACE_X_PORT = 3000;
  private static final String SPACE_X_IP = "localhost"; // change to actual ip
  private DatagramSocket spaceXSocket; // UDP socket to SpaceX
  private InetAddress spaceXAddress;

  @Override
  public void run() {
    ServerSocket listener = getServerSocket(PORT);
    System.out.println("Server now listening on port " + PORT);

    while (true) {
        System.out.println("Waiting to connect to client...");
        client = getClientServerFromListener(listener);
        connected = true;
        System.out.println("Connected to client");
    
        // Thread spaceXWorker = new Thread(new SpaceXSender());
        Thread messageReaderWorker = new Thread(new MessageReader());
    
        // spaceXWorker.start();
        messageReaderWorker.start();
    
        try {
            // spaceXWorker.join();
            messageReaderWorker.join();
        } catch (InterruptedException e) {
            System.out.println(
            "Problem joining spaceXWorker/messageReaderWorker threads"
            );
        }
    
        closeClient(client);
    }
  }

  public void sendMessage(String message) {
    try {
      Thread sendWorker = new Thread(new MessageSender(message));
      sendWorker.start();
      sendWorker.join();
    } catch (InterruptedException e) {
      System.out.println("Problem joining sendWorker thread");
    } catch (NullPointerException e) {
      System.out.println("Could not send message, client probably not running");
    }
  }

  private class MessageSender implements Runnable {
    private String command;

    public MessageSender(String msg) {
      if (msg == null) {
        throw new NullPointerException();
      }
      command = msg;
    }

    @Override
    public void run() {
      try {
        OutputStream os = client.getOutputStream();
        OutputStreamWriter osw = new OutputStreamWriter(os);
        BufferedWriter bw = new BufferedWriter(osw);
        StringBuilder str = new StringBuilder();
        str.append(command.length());
        while (str.toString().getBytes().length < 8) {
          str.append(' ');
        }
        bw.write(str.toString());
        bw.write(command);
        bw.flush();
        System.out.println("Sent \"" + command + "\" to client");
      } catch (IOException e) {
        System.out.println("Error sending message to client");
      }
    }
  }

  private class MessageReader implements Runnable {

    @Override
    public void run() {
      System.out.println("Started reading");
      while (true) {
        try {
          InputStream is = client.getInputStream();
          InputStreamReader isr = new InputStreamReader(is);
          BufferedReader br = new BufferedReader(isr);
          msgFromClient = new JSONObject(br.readLine());
        } catch (IOException e) {
          System.out.println("IO Exception: " + e);
          throw new RuntimeException("Failed getting input stream");
        } catch (NullPointerException e) {
          System.out.println("Client probably disconnected");
          connected = false;
          break;
        }
      }
    }
  }

  private class SpaceXSender implements Runnable {
    private ByteBuffer buffer;

    public SpaceXSender() {
      buffer = ByteBuffer.allocate(34); // 34 bytes as specified by SpaceX
      try {
        spaceXSocket = new DatagramSocket();
        spaceXAddress = InetAddress.getByName(SPACE_X_IP);
        System.out.println("SPACEX ADDRESS: " + spaceXAddress);
      } catch (SocketException e) {
        System.out.println("SpaceX socket initialization failed");
      } catch (UnknownHostException e) {
        System.out.println("Couldn't resolve SpaceX hostname");
      }
    }

    @Override
    public void run() {
      while (connected) {
        if (msgFromClient != null) {
          String state = null; // TODO: get state from msgFromClient
          Byte status = 0;
          switch (state) {
            case "INVALID":
              System.out.println("Shouldn't receive this state");
              break;
            case "EMERGENCY_BRAKING":
            case "FAILURE_STOPPED":
              status = 0; // Fault
              break;
            case "IDLE":
            case "CALIBRATING":
            case "RUN_COMPLETE":
            case "FINISHED":
              status = 1; // Safe to approach
              break;
            case "READY":
              status = 2; // Ready to launch
              break;
            case "ACCELERATING":
              status = 3; // Launching
              break;
            case "NOMINAL_BRAKING":
              status = 5; // Braking
              break;
            case "EXITING":
              status = 6; // Crawling
              break;
            default:
              status = 0; // Default to fault
          }

          // TODO: extract data from msgFromClient
          // int acceleration = Math.round(
          //   msgFromClient.getJSONObject("navigation").getFloat("acceleration") *
          //   100
          // ); // times 100 for m/s^2 to cm/s^2
          // int distance = Math.round(
          //   msgFromClient.getJSONObject("navigation").getFloat("distance") * 100
          // ); // times 100 for m to cm
          // int velocity = Math.round(
          //   msgFromClient.getJSONObject("navigation").getFloat("velocity") * 100
          // ); // times 100 for m/s to cm/s
          int acceleration = 0;
          int distance = 0;
          int velocity = 0;

          buffer.put(teamID);
          buffer.put(status);
          buffer.putInt(acceleration); // acceleration
          buffer.putInt(distance); // distance
          buffer.putInt(velocity); // velocity
          buffer.putInt(0); // battery voltage (optional, set to 0)
          buffer.putInt(0); // battery current (optional, set to 0)
          buffer.putInt(0); // battery temp (optional, set to 0)
          buffer.putInt(0); // pod temp (optional, set to 0)
          buffer.putInt(0); // stripe count (optional, set to 0)

          byte[] bufferArray = buffer.array();
          DatagramPacket packet = new DatagramPacket(
            bufferArray,
            bufferArray.length,
            spaceXAddress,
            SPACE_X_PORT
          );

          try {
            spaceXSocket.send(packet);
          } catch (IOException e) {
            System.out.println("Failure sending to SpaceX socket");
          }

          buffer.clear();
        }

        try {
          Thread.sleep(30);
        } catch (InterruptedException e) {
          System.out.println(
            "Error putting thread to sleep while sending to SpaceX"
          );
        }
      }

      // we've disconnected, send one final frame to SpaceX
      // TODO: catch first disconnection
      buffer.clear();

      Byte status = 0;

      buffer.put(teamID);
      buffer.put(status); // PUT INTO FAULT STATE
      buffer.putInt(0); // acceleration
      buffer.putInt(0); // position
      buffer.putInt(0); // velocity
      buffer.putInt(0); // battery voltage (optional, set to 0)
      buffer.putInt(0); // battery current (optional, set to 0)
      buffer.putInt(0); // battery temp (optional, set to 0)
      buffer.putInt(0); // pod temp (optional, set to 0)
      buffer.putInt(0); // stripe count (optional, set to 0)

      byte[] bufferArray = buffer.array();
      DatagramPacket packet = new DatagramPacket(
        bufferArray,
        bufferArray.length,
        spaceXAddress,
        SPACE_X_PORT
      );

      try {
        spaceXSocket.send(packet);
      } catch (IOException e) {
        System.out.println("Failure sending to SpaceX socket");
      }
    }
  }

  private static ServerSocket getServerSocket(int portNum) {
    try {
      return new ServerSocket(portNum);
    } catch (IOException e) {
      throw new RuntimeException("Failed to get new server socket");
    }
  }

  private static Socket getClientServerFromListener(ServerSocket lstn) {
    try {
      return lstn.accept();
    } catch (IOException e) {
      throw new RuntimeException("Failed to get new client socket");
    }
  }

  private static void closeClient(Socket clientSocket) {
    try {
      clientSocket.close();
    } catch (IOException e) {
      throw new RuntimeException("Error closing client socket");
    }
  }

  private static void closeServer(ServerSocket serverSocket) {
    try {
      serverSocket.close();
    } catch (IOException e) {
      throw new RuntimeException("Error closing server socket");
    }
  }

  public JSONObject getMessage() {
    return msgFromClient;
  }

  public boolean isConnected() {
    return connected;
  }
}
