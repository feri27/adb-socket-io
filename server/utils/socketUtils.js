const socketIO = require("socket.io");
const ADBHelper = require('../adb/adb-helper');

exports.sio = (server) => {
  return socketIO(server, {
    transports: ["polling"],
    cors: {
      origin: "*",
    },
  });
};

exports.connection = (io) => {
  io.on("connection", (socket) => {
    console.log("A user is connected");

    // socket.on("message", (message) => {

    //   adbHelper = new ADBHelper.ADBHelper('adb');

    //   adbHelper.getDevices((adbDevicesResult) => {

    //     if (adbDevicesResult.code != 0) {
    //       socket.emit("message", 'Error: ' + adbDevicesResult.stderr);
    //     }

    //     let devices = adbDevicesResult.devices;
    //     if (devices.length == 0) {
    //       socket.emit("message", 'No devices found.');
    //     } else {
    //       for (const device of devices) {
    //         socket.emit("message", device.id);

    //       }
    //     }
    //   });
    // });

    socket.on("data", (message) => {

      var array = [];

      adbHelper.setCurDevice(message);

      adbHelper.setCurDir('/sdcard/');

      adbHelper.getDirList((adbDirListResult) => {

        if (adbDirListResult.code != 0) {
          console.log('Error: ' + adbDirListResult.stderr);
          socket.emit("data", 'Error: ' + adbDirListResult.stderr);
        }

        let dirList = adbDirListResult.dirList;
        

        for (let file of dirList) {
          let fileName = file.name;

          if (ADBHelper.isFileDir(file)) {

            console.log('\t' + fileName);
            //array.push(fileName);
          } else {

            console.log('\t' + fileName);
            array.push(fileName);

          }

          const filePath = adbHelper.getCurDir() + fileName;
          console.log(filePath);
          
          

        }
        socket.emit("data", array);
        });
        
    });

    socket.on("disconnect", () => {
      console.log(`socket ${socket.id} disconnected`);
    });

  });

  setInterval(() => {
    adbHelper = new ADBHelper.ADBHelper('adb');

      adbHelper.getDevices((adbDevicesResult) => {

        if (adbDevicesResult.code != 0) {
          io.emit("message", 'Error: ' + adbDevicesResult.stderr);
        }

        let devices = adbDevicesResult.devices;
        if (devices.length == 0) {
          io.emit("message", 'No devices found.');
        } else {
          for (const device of devices) {
            io.emit("message", device.id);

          }
        }
      });
  }
    , 1000);

};

function DeviceList(socket) {

  adbHelper = new ADBHelper.ADBHelper('adb');

  adbHelper.getDevices((adbDevicesResult) => {

    if (adbDevicesResult.code != 0) {
      console.log('Error: ' + adbDevicesResult.stderr);
      socket.emit("DEVICE", 'Error: ' + adbDevicesResult.stderr);
      return false;
    }

    let devices = adbDevicesResult.devices;
    if (devices.length == 0) {
      console.log('No devices found.');
      socket.emit("DEVICE", 'No devices found.');
      return false;
    } else {
      for (const device of devices) {
        console.log(device);
        socket.emit("DEVICE", device);

      }

      return true;


    }
  });
}


const refreshDeviceList = async () => {

  adbHelper = new ADBHelper.ADBHelper('adb');



  const waitConnection = async () => {
    adbHelper.getDevices((adbDevicesResult) => {

      if (adbDevicesResult.code != 0) {
        console.log('Error: ' + adbDevicesResult.stderr);
        return false;
      }

      let devices = adbDevicesResult.devices;
      if (devices.length == 0) {
        console.log('No devices found.');
        return false;
      } else {
        for (const device of devices) {
          console.log(device);
          //refreshDirList(device.id);

        }

        return true;


      }
    });
  }

  await waitConnection();

};

function refreshDirList(device_id) {

  adbHelper.setCurDevice(device_id);

  adbHelper.setCurDir('/sdcard/');

  adbHelper.getDirList((adbDirListResult) => {

    if (adbDirListResult.code != 0) {
      console.log('Error: ' + adbDirListResult.stderr);
      return;
    }

    let dirList = adbDirListResult.dirList;

    for (let file of dirList) {
      let fileName = file.name;

      if (ADBHelper.isFileDir(file)) {

        console.log('\t' + fileName);
      } else {

        console.log('\t' + fileName);

      }

      const filePath = adbHelper.getCurDir() + fileName;
      console.log(filePath);
      //transferFile('pull', filePath);


    }
  });

};

function transferFile(mode, path) {

  let modeText = (mode == 'pull') ? 'Pull' : 'Push';
  let fileName = path;

  const destPath = (mode == 'pull') ? '/Users/larasof/Downloads' : adbHelper.getCurDir();
  adbHelper.transferFile(mode, path, destPath, (progressPercent) => {
    console.log(modeText + ' ' + fileName + ': ' + progressPercent + '%');

  }, (adbTransferResult) => {
    if (adbTransferResult.code == 0) {
      console.log(modeText + ' ' + fileName + ': Success');

      if (mode == 'pull') {
        console.log('Downloaded to ' + destPath + fileName);
      }
    } else {
      console.log(modeText + ' ' + fileName + ': Error');
      console.log(adbTransferResult.stderr);
    }

    fileNameHtml = fileName;
    if (fileName.length > 40) {
      fileNameHtml = fileName.substr(0, 30) + '...';
    }
    console.log(fileNameHtml);
  });

};
