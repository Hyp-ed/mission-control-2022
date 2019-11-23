# Base-Station 2020

This is the backend for the HYPED base-station, and is responsible for communicating with the hyperloop pod and sending relevant commands and information back and forth. Written in Java with the Spring Boot framework, it communicates to the pod using JSON messages sent over a TCP socket, and displays information on the React [frontend](https://github.com/Hyp-ed/base-station-2019-frontend). The web interface is also included in here as a submodule.

### How to run
Download the latest release from Github, and run:
```
$ java -jar base-station-2020.jar
```

Go to `localhost:8080` for the gui.

Then run `./hyped` (from the hyped-2020 repo) to start the pod, and you should see the pod connecting on the gui.

### Build project:
This project uses gradle as its build system. Only manually build the project instead of using the released jar file as explained above if you actually intend to work on the base-station. The gradle wrapper is already checked into this repo, so no need to explicitly download gradle (unless you want to).

Run:
```
$ ./gradlew build
```

(If on windows use `gradlew.bat` instead of `./gradlew`)

This will create a jar file in `build/libs/` that contains both the backend and the static frontend that it serves.
