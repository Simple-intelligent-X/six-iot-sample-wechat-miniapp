// logs.ts
// const util = require('../../utils/util.js')
//import { formatTime } from '../../utils/util'

Component({
  data: {
    loginStatus: {},
    token: '',
    phone: '',
    deviceId: '',
    phoneMask: ''
  },
  lifetimes: {
    attached() {
      const loginStatus = wx.getStorageSync('loginStatus');
      this.setData({
        loginStatus: loginStatus,
        token: JSON.stringify(loginStatus.token),
        phone: loginStatus.phone,
        phoneMask: loginStatus.phoneMask
      })
      this.startBLE();
    }
  },

  methods: {
    signOut: function () {
      wx.clearStorageSync()
      wx.navigateTo({
        url: '../index/index',
        success: res => {
          console.log('navigateTo success' + res)
        },
        fail: function (e) {
          console.log('navigateTo fail: ' + JSON.stringify(e))
        }
      });
      if(this.data.deviceId && this.data.deviceId != '') {
        const deviceId = this.data.deviceId;
        wx.closeBLEConnection({
          deviceId
        })
      }
      wx.closeBluetoothAdapter({})
    },

    startBLE : function() {
      //the callback for discovering of the BLE device
      wx.onBluetoothDeviceFound((res) => {
        res.devices.forEach((device) => {
          // 这里可以做一些过滤
          console.log('Device Found', device)
          if(device.name == 'BLUFI_DEVICE') {
            this.connectDevice(device.deviceId)
          }
        })
        // 找到要搜索的设备后，及时停止扫描
        wx.stopBluetoothDevicesDiscovery()
      })
      
      // Init the BLE adapter
      wx.openBluetoothAdapter({
        mode: 'central',
        success: (res) => {
          console.log('openBluetoothAdapter, startBluetoothDevicesDiscovery')
          wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: false,
          })
        },
        fail: (res) => {
          if (res.errCode !== 10001) return
          wx.onBluetoothAdapterStateChange((res) => {
            if (!res.available) return
            wx.startBluetoothDevicesDiscovery({
              allowDuplicatesKey: false,
            })
          })
        }
      })
    },

    connectDevice: function (deviceId: string) {
      console.log('connectDevice : ' + deviceId);
      this.data.deviceId = deviceId;
      wx.createBLEConnection({
        deviceId, // 搜索到设备的 deviceId
        success: () => {
          console.log('connectDevice succeed, to get device services')
          wx.getBLEDeviceServices({
            deviceId, // 搜索到设备的 deviceId
            success: (res) => {
              for (let i = 0; i < res.services.length; i++) {
                this.getChars(deviceId, res.services[i].uuid)
              }
            }
          })
        }
      })
    },

    getChars : function (deviceId: string, serviceId: string) {
      console.log('getChars, deviceId: ' + deviceId + ', serviceId: ' + serviceId);
      wx.getBLEDeviceCharacteristics({
        deviceId, // 搜索到设备的 deviceId
        serviceId, // 上一步中找到的某个服务
        success: (res) => {
          for (let i = 0; i < res.characteristics.length; i++) {
            let item = res.characteristics[i]
            console.log('char.uuid: ' + item.uuid + ', serviceId: ' + serviceId +', properties: ' + JSON.stringify(item.properties))
            if (item.properties.write) { // 该特征值可写
              // 本示例是向蓝牙设备发送一个 0x00 的 16 进制数据
              // 实际使用时，应根据具体设备协议发送数据
              let buffer = new ArrayBuffer(1)
              let dataView = new DataView(buffer)
              dataView.setUint8(0, 0)
              wx.writeBLECharacteristicValue({
                deviceId,
                serviceId,
                characteristicId: item.uuid,
                value: buffer,
              })
            }
            if (item.properties.read) { // 该特征值可读
              wx.readBLECharacteristicValue({
                deviceId,
                serviceId,
                characteristicId: item.uuid,
              })
            }
            if (item.properties.notify || item.properties.indicate) {
              // 必须先启用 wx.notifyBLECharacteristicValueChange 才能监听到设备 onBLECharacteristicValueChange 事件
              console.log('notify or indicate char, to setup the notification for value change')
              wx.notifyBLECharacteristicValueChange({
                deviceId,
                serviceId,
                characteristicId: item.uuid,
                state: true,
              })
            }
          }
        }
      })
      // 操作之前先监听，保证第一时间获取数据
      wx.onBLECharacteristicValueChange((result) => {
        // 使用完成后在合适的时机断开连接和关闭蓝牙适配器
        console.log('onBLECharacteristicValueChange: ' + JSON.stringify(result))
      })
    }
    
  }
})
