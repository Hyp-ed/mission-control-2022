package server;

import java.io.*;
import java.net.*;
import java.nio.*;
import java.nio.file.FileSystems;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.*;
import org.springframework.stereotype.Service;

@Service
public class Server implements Runnable {
  private static final int TELEMETRY_PORT = 9090;
  private static final int DEBUG_PORT = 7070;

  private Socket telemetryClient; // TCP socket to pod
  private Process debugProcess;

  // Telemetry
  private JSONObject telemetryData;
  private boolean telemetryConnected = false;

  // Debug
  private String searchPhrase;
  private JSONArray terminalOutput = new JSONArray();

  @Override
  public void run() {
    ServerSocket telemetryServer = getServerSocket(TELEMETRY_PORT);
    System.out.println("Server now listening on port " + TELEMETRY_PORT);

    while (true) {
      System.out.println("Waiting to connect to client...");
      telemetryClient = getTelemetryClient(telemetryServer);
      telemetryConnected = true;
      System.out.println("Connected to telemetry client");

      Thread telemetryMessageReaderWorker = new Thread(new TelemetryMessageReader());

      telemetryMessageReaderWorker.start();
      try {
        telemetryMessageReaderWorker.join();
      } catch (InterruptedException e) {
        System.out.println("Problem joining telemetryMessageReaderWorker threads");
      }
      closeClient(telemetryClient);
    }
    // closeServer(telemetryServer);
  }

  private class StreamGobbler extends Thread {
    InputStream is;

    private StreamGobbler(InputStream is) {
      this.is = is;
    }

    @Override
    public void run() {
      try {
        InputStreamReader isr = new InputStreamReader(is);
        BufferedReader br = new BufferedReader(isr);
        String line = null;
        while ((line = br.readLine()) != null) {
          JSONObject output = parseDebugOutput(line);
          terminalOutput.put(output);
        }
      }
      catch (IOException ioe) {
        System.out.println("StreamGobbler stream has closed");
      }
    }
  }

  private JSONObject parseDebugOutput(String line) {
    JSONObject obj = new JSONObject();
    //                                     h       m     s        ms     dbg    [submodule]   log
    Pattern pattern = Pattern.compile("(\\d{2}:\\d{2}:\\d{2}\\.\\d{3}) (\\w*)\\[([\\w-]*)\\]: (.*)");
    Matcher matcher = pattern.matcher(line);

    if (matcher.find()) {
      obj.put("time", matcher.group(1));
      obj.put("log_type", matcher.group(2));
      obj.put("submodule", matcher.group(3));
      obj.put("log", matcher.group(4));
    }
    
    obj.put("line", line);
    return obj;
  }

  public void debugRun(JSONArray flags) {
    String DIR_PATH = FileSystems.getDefault().getPath("./").toAbsolutePath().toString();
    String HYPED_PATH = DIR_PATH.substring(0, DIR_PATH.length() - 1) + "hyped-pod_code"; // change this part for RELEASE

    ArrayList<String> command = new ArrayList<String>();
    command.add("stdbuf");
    command.add("-oL");
    command.add("./hyped");
    for (int i = 0, size = flags.length(); i < size; i++) {
      String flag = flags.getString(i);
      command.add(flag);
    }
    command.add("-v");
    command.add("-d");

    try {
      System.out.println("Reading from: " + HYPED_PATH);
      terminalOutput = new JSONArray();
      debugProcess = new ProcessBuilder(command).directory(new File(HYPED_PATH)).start();

      StreamGobbler errorGobbler = new StreamGobbler(debugProcess.getErrorStream());
      StreamGobbler outputGobbler = new StreamGobbler(debugProcess.getInputStream());
          
      // start gobblers
      outputGobbler.start();
      errorGobbler.start();

    } catch (Throwable t) {
      t.printStackTrace();
    }
  }

  public void debugKill() {
    if (debugProcess == null) {
      return;
    }
    debugProcess.destroy();
  }

  public void debugUpdateSearchPhrase(String searchPhrase) {
    this.searchPhrase = searchPhrase;
  }

  public void telemetrySendCommand(String command) {
    try {
      OutputStream os = telemetryClient.getOutputStream();
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
      System.out.println("Error sending message to telemetryClient");
    }
  }

  private class TelemetryMessageReader implements Runnable {
    @Override
    public void run() {
      System.out.println("Started reading telemetry");
      InputStream is;
      try {
        is = telemetryClient.getInputStream();
      } catch (IOException e) {
        System.out.println("IO Exception: " + e);
        throw new RuntimeException("Failed getting input stream");
      }
      InputStreamReader isr = new InputStreamReader(is);
      BufferedReader br = new BufferedReader(isr);
      while (true) {
        try {
          telemetryData = new JSONObject(br.readLine());
        } catch (IOException e) {
          System.out.println("IO Exception: " + e);
          throw new RuntimeException("Failed getting input stream");
        } catch (NullPointerException e) {
          System.out.println("telemetryClient probably disconnected");
          telemetryConnected = false;
          break;
        }
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

  private static Socket getTelemetryClient(ServerSocket lstn) {
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

  private void appendTerminalOutput(JSONArray sourceArray) {
    JSONArray newTerminalOutput = new JSONArray();
    for (
      int i = Math.max(
        0,
        terminalOutput.length() - (100 - sourceArray.length())
      );
      i < terminalOutput.length();
      i++
    ) {
      newTerminalOutput.put(terminalOutput.getJSONObject(i));
    }
    for (int i = 0; i < sourceArray.length(); i++) {
      newTerminalOutput.put(sourceArray.getJSONObject(i));
    }
    terminalOutput = newTerminalOutput;
  }

  public String getTelemetryData() {
    if (telemetryData == null) {
      return null;
    }
    return telemetryData.toString();
  }

  public boolean isTelemetryConnected() {
    return telemetryConnected;
  }

  public String getTerminalOutput() {
    if (terminalOutput.isEmpty()) {
      return null;
    }

    if (searchPhrase == null) {
      return terminalOutput.toString();
    }
    
    JSONArray newTerminalOutput = new JSONArray();
    for (int i = 0; i < terminalOutput.length(); i++) {
      String cur_line = terminalOutput.getJSONObject(i).toString();
      if (cur_line.toLowerCase().contains(searchPhrase.toLowerCase())) {
        newTerminalOutput.put(terminalOutput.getJSONObject(i));
      }
    }

    return newTerminalOutput.toString();
  }
}
