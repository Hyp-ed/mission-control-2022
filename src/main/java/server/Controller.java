package server;

import javax.annotation.*;
import org.json.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;

@RestController
public class Controller {
  @Autowired
  private Server server;

  @Autowired
  private SimpMessagingTemplate template;

  @Autowired
  private TaskScheduler scheduler;

  private final int PING_INTERVAL = 100;

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
          scheduler.scheduleAtFixedRate(() -> pingTelemetryConnection(), PING_INTERVAL);
          scheduler.scheduleAtFixedRate(() -> pingTelemetryData(), PING_INTERVAL);
          scheduler.scheduleAtFixedRate(() -> pingDebugConnection(), PING_INTERVAL);
          scheduler.scheduleAtFixedRate(() -> pingTerminalOutput(), PING_INTERVAL);
          scheduler.scheduleAtFixedRate(() -> pingDebugStatus(), PING_INTERVAL);
          scheduler.scheduleAtFixedRate(() -> pingDebugError(), PING_INTERVAL);

          return; // end thread
        }
      }
    );

    checkToScheduleThread.start();
  }

  @MessageMapping("/send/debug/connect")
  public void debugConnect(String serverName) {
    if (serverName == null) {
      return;
    }
    server.debugConnect(serverName);
  }

  @MessageMapping("/send/debug/compileRun")
  public void debugCompile(String flagsString) {
    JSONArray flags = new JSONArray(flagsString);
    server.debugCompile();
    server.debugRun(flags);
  }

  @MessageMapping("/send/debug/run")
  public void debugRun(String flagsString) {
    JSONArray flags = new JSONArray(flagsString);
    server.debugRun(flags);
  }

  @MessageMapping("/send/debug/reset")
  public void debugReset() {
    server.debugReset();
  }

  @MessageMapping("/send/debug/kill")
  public void debugKill() {
    server.debugKill();
  }

  @MessageMapping("/send/telemetry/search")
  public void updateSearchPrase(String jsonStr) {
    JSONObject search = new JSONObject(jsonStr);
    server.updateSearchPhrase(search.getString("searchPhrase"));
  } 

  @MessageMapping("/send/telemetry/command")
  @SendTo("/topic/send/telemetry/command/status")
  public String sendTelemetryCommand(String command) {
    try {
      if (server.isTelemetryConnected()) {
        server.telemetrySendCommand(command);
        return getResponseMessage("success", "successfully sent command " + command);
      }
    } catch (JSONException e) {
      return getResponseMessage("error", "poorly formed json attempted to be sent to server (probs entered nothing in run_length box)");
    }

    return getResponseMessage("error", "could not send message");
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
      template.convertAndSend(
        "/topic/telemetry/data",
        server.getTelemetryData()
      );
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
      template.convertAndSend(
        "/topic/debug/output",
        server.getTerminalOutput()
      );
    }
  }

  public void pingDebugStatus() {
    if (server.getDebugStatus() != null) {
      template.convertAndSend(
        "/topic/debug/status",
        server.getDebugStatus()
      );
    }
  }

  public void pingDebugError() {
    if (server.getDebugError() != null) {
      template.convertAndSend(
        "/topic/debug/error",
        server.getDebugError()
      );
    }
  }

  public String getResponseMessage(String status, String message) {
    JSONObject response = new JSONObject();
    response.put("status", status);
    response.put("message", message);
    return response.toString();
  }
}
