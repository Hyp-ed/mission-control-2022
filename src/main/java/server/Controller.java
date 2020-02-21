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
      startPingingData();
    }
  }

  public void startPingingData() {
    Thread checkToScheduleThread = new Thread(
      new Runnable() {

        @Override
        public void run() {
          scheduler.scheduleAtFixedRate(() -> pingTelemetryConnection(), 100);
          scheduler.scheduleAtFixedRate(() -> pingTelemetryData(), 100);
          scheduler.scheduleAtFixedRate(() -> pingDebugConnection(), 100);
          scheduler.scheduleAtFixedRate(() -> pingTerminalOutput(), 100);

          return; // end thread
        }
      }
    );

    checkToScheduleThread.start();
  }

  @MessageMapping("/send/telemetry/command")
  @SendTo("/topic/send/telemetry/command/status")
  public String sendTelemetryCommand(String command) {
    try {
      if (server != null && server.isTelemetryConnected()) {
        server.sendTelemetryCommand(command);
        return "{\"status\":\"sent command\", \"message\":" + command + "}";
      }
    } catch (JSONException e) {
      return "{\"status\":\"error\", \"errorMessage\":\"poorly formed json attempted to be sent to server (probs entered nothing in run_length box)\"}";
    }

    return "{\"status\":\"error\", \"errorMessage\":\"could not send message\"}";
  }

  public void pingTelemetryConnection() {
    if (!server.isTelemetryConnected()) {
      template.convertAndSend("/topic/telemetry/connection", "DISCONNECTED");
    } else {
      template.convertAndSend("/topic/telemetry/connection", "CONNECTED");
    }
  }

  public void pingTelemetryData() {
    if (server.getTelemetryData() != null) {
      template.convertAndSend("/topic/telemetry/data", server.getTelemetryData().toString());
    }
  }

  public void pingDebugConnection() {
    if (!server.isDebugConnected()) {
      template.convertAndSend("/topic/debug/connection", "DISCONNECTED");
    } else {
      template.convertAndSend("/topic/debug/connection", "CONNECTED");
    }
  }

  public void pingTerminalOutput() {
    if (server.getTerminalOutput() != null) {
      template.convertAndSend("/topic/debug/output", server.getTerminalOutput());
    }
  }
}
