package server;

import javax.annotation.*;
import org.json.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;

@org.springframework.stereotype.Controller 
public class Controller {
  @Autowired
  private Server server;

  @Autowired
  private SimpMessagingTemplate template;

  @Autowired
  private TaskScheduler scheduler;

  @PostConstruct
  public void initialize() {
    if (server != null) {
      Thread serverThread = new Thread(server);
      serverThread.start();
      System.out.println("Server started");
    }
  }

  @MessageMapping("/pullData")
  @SendTo("/topic/isPodConnected")
  public void startPingingData() {
    Thread checkToScheduleThread = new Thread(
      new Runnable() {

        @Override
        public void run() {
          while (!server.isConnected()) {
            try {
              Thread.sleep(200);
            } catch (InterruptedException e) {
              System.out.println(
                "Error putting thread to sleep while checking if pod is connected"
              );
            }
          }

          scheduler.scheduleAtFixedRate(() -> pingPodConnectionStatus(), 100);
          scheduler.scheduleAtFixedRate(() -> pingData(), 100);

          return; // end thread
        }
      }
    );

    checkToScheduleThread.start();
  }

  @MessageMapping("/sendMessage")
  @SendTo("/topic/sendMessageStatus")
  public String sendMessage(String msg) {
    try {
      if (server != null && server.isConnected()) {
        server.sendMessage(msg);
        return "{\"status\":\"sent msg\", \"message\":" + msg + "}";
      }
    } catch (JSONException e) {
      return "{\"status\":\"error\", \"errorMessage\":\"poorly formed json attempted to be sent to server (probs entered nothing in run_length box)\"}";
    }

    return "{\"status\":\"error\", \"errorMessage\":\"could not send message\"}";
  }

  public void pingPodConnectionStatus() {
    if (!server.isConnected()) {
      template.convertAndSend("/topic/isPodConnected", "DISCONNECTED");
    } else {
      template.convertAndSend("/topic/isPodConnected", "CONNECTED");
    }
  }

  public void pingData() {
    if (server.getMessage() != null) {
      template.convertAndSend("/topic/podData", server.getMessage().toString());
    }
  }
}
