package server;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import telemetrydata.TelemetryData.*;
import com.google.protobuf.util.JsonFormat;
import com.google.protobuf.InvalidProtocolBufferException;
import org.json.*;

@RestController
public class Controller {

    @Autowired
    private Server server;

    // starts base station server, and returns if it has connected to pod client or not
    @RequestMapping(path = "/server", method = RequestMethod.POST)
    public String postServer() {
        if (server != null) {
            Thread serverThread = new Thread(server);
            serverThread.start();
            System.out.println("Server started");
        }

        return String.valueOf(server.isConnected());
    }

    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    private TaskScheduler scheduler;

    @MessageMapping("/pullData")
    @SendTo("/topic/isPodConnected")
    public void startPingingData() {
        Thread checkToScheduleThread = new Thread(new Runnable() {

            @Override
            public void run() {
                while (!server.isConnected()) {
                    try {
                        Thread.sleep(200);
                    }
                    catch (InterruptedException e) {
                        System.out.println("Error putting thread to sleep while checking if pod is connected");
                    }
                }

                template.convertAndSend("/topic/isPodConnected", "CONNECTED");

                scheduler.scheduleAtFixedRate(() -> pingPodConnectionStatus(), 100);
                scheduler.scheduleAtFixedRate(() -> pingData(), 100);

                return;  // end thread
            }
        });

        checkToScheduleThread.start();
    }

    @MessageMapping("/sendMessage")
    @SendTo("/topic/sendMessageStatus")
    public String sendMessage(String msg) {
        try {
            if (server != null && server.isConnected()) {
                server.sendMessage(new JSONObject(msg));
                return "{\"status\":\"sent msg\", \"message\":" + msg + "}";
            }
        }
        catch (JSONException e) {
            return "{\"status\":\"error\", \"errorMessage\":\"poorly formed json attempted to be sent to server (probs entered nothing in run_length box)\"}";
        }

        return "{\"status\":\"error\", \"errorMessage\":\"could not send message\"}";
    }

    public void pingPodConnectionStatus() {
        if (!server.isConnected()) {
            template.convertAndSend("/topic/isPodConnected", "DISCONNECTED");
            System.out.println("DISCONNECTED TO POD");
        }
        else {
            template.convertAndSend("/topic/isPodConnected", "CONNECTED");
        }
    }

    public void pingData() {
        ClientToServer msg = server.getProtoMessage();

        try {
            forwardToFrontend(msg);
        }
        catch (InvalidProtocolBufferException e) {
            System.out.println("InvalidProtocolBufferException (Handled): " + e);
            template.convertAndSend("/topic/errors", "server received invalid protobuf message");
        }
        catch (NullPointerException e) {
            System.out.println("Error (Handled): " + e);
        }
    }

    public void forwardToFrontend(ClientToServer msg) throws InvalidProtocolBufferException {
        JsonFormat.Printer protoJsonPrinter = JsonFormat.printer();
        template.convertAndSend("/topic/podData", protoJsonPrinter.print(msg));
    }
}
