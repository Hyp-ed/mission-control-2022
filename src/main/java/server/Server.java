package server;

import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.*;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

@Service
public class Server implements Runnable {
  private static final int TELEMETRY_PORT = 9090;
  private static final int DEBUG_PORT = 7070;

  private static final String BUILD_DIRECTORY = "gui-build";
  private static final String CONFIG_DIRECTORY = "configurations";
  private static final String BASE_CONFIG_FILE = "config.json";
  private static final String FAKE_DATA_CONFIG_FILE = "fake_config.json";
  private static final String SERVER_CONFIG_FILE = "config.server.json";

  private Socket telemetryClient; // TCP socket to pod
  private Process debugProcess;

  // Telemetry
  private JSONObject telemetryData;
  private boolean telemetryConnected = false;

  // Fake systems
  private static final String[] FAKE_SYSTEM_FLAGS = {
      "use_fake_trajectory", "use_fake_batteries", "use_fake_batteries_fail",
      "use_fake_temperature", "use_fake_temperature_fail", "use_fake_brakes",
      "use_fake_controller", "use_fake_high_power"
  };

  // Debug
  private String searchPhrase;
  private String logTypeFilter;
  private String submoduleFilter;
  private int curStart;
  private int curEnd;
  private boolean isLive = true;
  private boolean moreLines;
  private List<String> logTypes = new ArrayList<>(List.of(""));
  private List<String> submoduleTypes = new ArrayList<>(List.of(""));
  private JSONArray terminalOutput = new JSONArray();

  // Compile
  private static final String COMPILE = "COMPILE";
  private static final String COMPILING = "COMPILING";
  private static final String COMPILED = "RECOMPILE";
  private static final String RETRY = "RETRY";

  private static final String IS_COMPILED = "isCompiled";
  private static final String IS_SUCCESS = "isSuccess";
  private static final String ERROR_MESSAGE = "errorMessage";

  private boolean isCompiling = false; // A boolean indicating if the pod code is still compiling, mainly for the UI
  private String debugStatus = COMPILE;

  private JSONArray debugOutput = new JSONArray();
  private JSONObject debugData;

  @Override
  public void run() {
    // Initialize the compiling state
    initDebugData();

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

  private class StreamGobblerRun extends Thread {
    InputStream inputStream;

    private StreamGobblerRun(InputStream inputStream) {
      this.inputStream = inputStream;
    }

    @Override
    public void run() {
      try (Scanner scan = new Scanner(inputStream)) {
        while (scan.hasNextLine()) {
          JSONObject output = parseDebugOutput(scan.nextLine());
          terminalOutput.put(output);
        }
      } catch (Exception e) {
        System.out.println(e);
      }
    }
  }

  private class StreamGobblerCompile extends Thread {
    InputStream inputStream;

    private StreamGobblerCompile(InputStream inputStream) {
      this.inputStream = inputStream;
    }

    @Override
    public void run() {
      try (Scanner scan = new Scanner(inputStream)) {
        while (scan.hasNextLine()) {
          debugOutput.put(scan.nextLine());
        }
      } catch (Exception e) {
        System.out.println(e);
      }
    }
  }

  private JSONObject parseDebugOutput(String line) {
    JSONObject obj = new JSONObject();
    // h m s ms dbg [submodule] log
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

  // Compiles the pod code
  public void debugCompile() {
    initDebugData();
    debugStatus = COMPILING;
    isCompiling = true;
    final Path buildDirectoryPath = Paths.get(BUILD_DIRECTORY);
    final String cmakeFlags = "-DPEDANTIC=ON -DRELEASE=ON -DCOVERAGE=ON -DCROSS=OFF -DCMAKE_CXX_COMPILER=/usr/bin/clang++";
    if (!Files.isDirectory(buildDirectoryPath)) {
      System.out.printf("Did not find build directory at %s\n", BUILD_DIRECTORY);
      try {
        System.out.printf("Creating build directory at %s\n", BUILD_DIRECTORY);
        Files.createDirectories(buildDirectoryPath);
      } catch (final IOException e) {
        System.out.printf("Failed to create build directory at %s\n", BUILD_DIRECTORY);
        e.printStackTrace();
        isCompiling = false;
        debugData.put(IS_COMPILED, false);
        debugData.put(IS_SUCCESS, false);
        convertDebugOutput();
        return;
      }
    }
    Runtime runtime = Runtime.getRuntime();
    try {
      String cmakeCommand = String.format("cmake -S . -B %s %s", BUILD_DIRECTORY, cmakeFlags);
      System.out.printf("Running '%s'\n", cmakeCommand);
      Process cmakeProcess = runtime.exec(cmakeCommand);
      StreamGobblerCompile errorGobbler = new StreamGobblerCompile(cmakeProcess.getErrorStream());
      StreamGobblerCompile outputGobbler = new StreamGobblerCompile(cmakeProcess.getInputStream());
      errorGobbler.start();
      outputGobbler.start();
      cmakeProcess.waitFor();
      debugData.put(IS_COMPILED, true);
      if (cmakeProcess.exitValue() != 0) {
        throw new Exception("CMake failed with non-zero exit value");
      }
    } catch (final Exception e) {
      System.out.println("Failed to run CMake");
      e.printStackTrace();
      isCompiling = false;
      debugData.put(IS_COMPILED, false);
      debugData.put(IS_SUCCESS, false);
      convertDebugOutput();
      return;
    }
    try {
      String makeCommand = String.format("make -j -C %s", BUILD_DIRECTORY);
      System.out.printf("Running '%s'\n", makeCommand);
      Process makeProcess = runtime.exec(makeCommand);
      StreamGobblerCompile errorGobbler = new StreamGobblerCompile(makeProcess.getErrorStream());
      StreamGobblerCompile outputGobbler = new StreamGobblerCompile(makeProcess.getInputStream());
      errorGobbler.start();
      outputGobbler.start();
      makeProcess.waitFor();
      if (makeProcess.exitValue() != 0) {
        throw new Exception("GNU Make failed with non-zero exit value");
      }
    } catch (final Exception e) {
      System.out.println("Failed to run GNU Make");
      e.printStackTrace();
      isCompiling = false;
      debugData.put(IS_COMPILED, false);
      debugData.put(IS_SUCCESS, false);
      convertDebugOutput();
      return;
    }
    copyFilesInDirectory();
    System.out.println("Successfully compiled binary");
    debugStatus = COMPILED;
    isCompiling = false;
    debugData.put(IS_SUCCESS, true);
    debugData.put(IS_COMPILED, true);
  }

  private void copyFilesInDirectory() {
    try {
      Path sourceDirectory = Paths.get(CONFIG_DIRECTORY);
      Path targetDirectory = Paths.get(BUILD_DIRECTORY + "/" + CONFIG_DIRECTORY);
      // Create stream for src
      Stream<Path> files = Files.walk(sourceDirectory);
      // Copy all files and folders from src to dest
      files.forEach(file -> {
        try {
          Files.copy(file, targetDirectory.resolve(sourceDirectory.relativize(file)),
              StandardCopyOption.REPLACE_EXISTING);
        } catch (DirectoryNotEmptyException ignored) {
        } catch (IOException e) {
          e.printStackTrace();
        }
      });
      files.close();
    } catch (final Exception e) {
      System.out.println("Failed to copy configurations folder to gui-build");
      e.printStackTrace();
    }
  }

  public void convertDebugOutput() {
    StringBuffer errorMessage = new StringBuffer("");
    for (int i = 0; i < debugOutput.length(); i++) {
      errorMessage.append(debugOutput.getString(i));
      errorMessage.append("\n");
    }
    debugData.put(ERROR_MESSAGE, errorMessage.toString());
  }

  public String getDebugData() {
    if (debugData == null) {
      return null;
    }
    debugData.put(IS_COMPILED, isHypedExist());
    return debugData.toString();
  }

  public String getDebugStatus() {
    if (isCompiling) {
      debugStatus = COMPILING;
    } else if (!isHypedExist() && Boolean.TRUE.equals(debugData.get(IS_SUCCESS))) {
      debugStatus = COMPILE;
      isCompiling = false;
    }
    return debugStatus;
  }

  public boolean isHypedExist() {
    return Files.exists(Paths.get(BUILD_DIRECTORY, "hyped"));
  }

  public void initDebugData() {
    debugData = new JSONObject();
    debugData.put(IS_SUCCESS, true);
    debugData.remove(ERROR_MESSAGE);
    if (isHypedExist()) {
      debugStatus = COMPILED;
      debugData.put(IS_COMPILED, true);
    } else {
      debugStatus = COMPILE;
      debugData.put(IS_COMPILED, false);
    }
  }

  public void debugRun(JSONArray flags) {
    final Path buildDirectoryPath = Paths.get(BUILD_DIRECTORY);
    String os = System.getProperty("os.name").substring(0, 3);

    ArrayList<String> command = new ArrayList<String>();
    if (!os.equals("Mac")) {
      command.add("stdbuf");
      command.add("-oL");
    }

    createServerConfigFromFlags(flags);
    copyFilesInDirectory();

    command.add("./hyped");
    command.add("./" + CONFIG_DIRECTORY + "/" + SERVER_CONFIG_FILE);

    // command.add("-v");
    // command.add("--debug=3");

    try {
      System.out.println("Running from: " + buildDirectoryPath);
      terminalOutput = new JSONArray();
      debugProcess = new ProcessBuilder(command).directory(new File(String.valueOf(buildDirectoryPath))).start();

      StreamGobblerRun errorGobbler = new StreamGobblerRun(debugProcess.getErrorStream());
      StreamGobblerRun outputGobbler = new StreamGobblerRun(debugProcess.getInputStream());

      // start gobblers
      outputGobbler.start();
      errorGobbler.start();

    } catch (Throwable t) {
      t.printStackTrace();
    }
  }

  private void createServerConfigFromFlags(JSONArray flags) {
    try {
      JSONObject baseConfig = new JSONObject(
          new JSONTokener(new FileReader(CONFIG_DIRECTORY + "/" + BASE_CONFIG_FILE)));
      JSONObject fakeData = new JSONObject(
          new JSONTokener(new FileReader(CONFIG_DIRECTORY + "/" + FAKE_DATA_CONFIG_FILE)));
      JSONObject systemConfig = baseConfig.getJSONObject("system");

      for (String fakeFlag : FAKE_SYSTEM_FLAGS) {
        if (hasValue(flags, fakeFlag)) {
          systemConfig.put(fakeFlag, true);
        } else {
          systemConfig.put(fakeFlag, false);
        }
      }

      baseConfig.put("system", systemConfig);

      Iterator<String> fakeDataKeys = fakeData.keys();
      while (fakeDataKeys.hasNext()) {
          String key = fakeDataKeys.next();
          baseConfig.put(key, fakeData.get(key));
      }

      FileWriter serverConfigFile = new FileWriter(CONFIG_DIRECTORY + "/" + SERVER_CONFIG_FILE);
      serverConfigFile.write(baseConfig.toString());
      serverConfigFile.close();
      return;
    } catch (FileNotFoundException e) {
      e.printStackTrace();
      throw new RuntimeException("Unable to find default config");
    } catch (IOException e) {
      e.printStackTrace();
      throw new RuntimeException("Unable to write server config");
    }
  }

  public boolean hasValue(JSONArray array, String value) {
    for (int i = 0; i < array.length(); i++) {
      if (array.get(i).toString().equals(value)) {
        return true;
      }
    }
    return false;
  }

  public void debugKill() {
    if (debugProcess == null) {
      return;
    }
    debugProcess.destroy();
  }

  public void debugUpdateSearchPhrase(String searchPhrase) {
    this.searchPhrase = searchPhrase.toLowerCase();
  }

  public void debugUpdateLogTypeFilter(String logTypeFilter) {
    this.logTypeFilter = logTypeFilter;
  }

  public void debugUpdateSubmoduleFilter(String submoduleFilter) {
    this.submoduleFilter = submoduleFilter;
  }

  public void debugUpdateSendMoreLines() {
    this.moreLines = true;
  }

  public void debugToggleIsLive() {
    this.isLive = !this.isLive;
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
      FileWriter file;
      try {
        file = new FileWriter("TelemetryData.txt");
      } catch (IOException e) {
        System.out.println("IOException: " + e);
        throw new RuntimeException("File creation failed.");
      }
      while (true) {
        try {
          telemetryData = new JSONObject(br.readLine());
          try {
            file.write(telemetryData + "\n");
            file.flush();
          } catch (IOException e) {
            System.out.println("IOException: " + e);
            throw new RuntimeException("Failed writing JSONObject to the file");
          }
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

    JSONArray newTerminalOutput = new JSONArray();
    for (int i = 0; i < terminalOutput.length(); i++) {
      JSONObject lineJson = terminalOutput.getJSONObject(i);
      String cur_line = lineJson.toString();
      String log_type, submodule, debug_output;
      boolean check1 = true, check2 = true, check3 = true;
      try {
        log_type = lineJson.getString("log_type");
        if (!logTypes.contains(log_type)) {
          logTypes.add(log_type);
        }
        check1 = (logTypeFilter == null || log_type.contains(logTypeFilter));
      } catch (Exception e) {
        // Don't want to flood stderr
        // System.err.println("log_type field not found in terminal output line");
      }
      try {
        submodule = lineJson.getString("submodule");
        if (!submoduleTypes.contains(submodule)) {
          submoduleTypes.add(submodule);
        }
        check2 = (submoduleFilter == null || submodule.contains(submoduleFilter));
      } catch (Exception e) {
        // System.err.println("submodule field not found in terminal output line");
      }
      try {
        debug_output = lineJson.getString("line").split("]: ")[1].toLowerCase();
        check3 = (searchPhrase == null || debug_output.contains(searchPhrase));
      } catch (Exception e) {
        // System.err.println("debug_output field not found in terminal output line");
      }

      if (check1 && check2 && check3) {
        newTerminalOutput.put(terminalOutput.getJSONObject(i));
      }
    }

    JSONObject ret = new JSONObject();
    if (newTerminalOutput.isEmpty()) {
      ret.put("terminalOutput", JSONObject.NULL);
    } else {
      JSONArray returnLines = new JSONArray();

      if (isLive) {
        curEnd = newTerminalOutput.length() - 1;
        curStart = Math.max(0, curEnd - 100);
      }

      if (moreLines) {
        curStart = Math.max(0, curStart - 100);
        moreLines = false;
      }

      for (int i = curStart; i <= curEnd; i++) {
        returnLines.put(newTerminalOutput.getJSONObject(i));
      }
      ret.put("terminalOutput", returnLines.toString());
    }

    ret.put("logTypes", logTypes);
    ret.put("submoduleTypes", submoduleTypes);
    ret.put("curStart", curStart);

    return ret.toString();
  }
}
