var util = require("../../util/util.js");
var cfg = require("../../config.js");
var app = getApp()
//引入百度地图api
var bmap = require('../../util/bmap-wx.js');

//用于保存BMap.search接口返回的数据
var wxMarkerData = [];
var BMap={};
Page({
  data: {
    height: 'auto',
    markers: [],
    latitude: '',
    longitude: ''
  },
  onReady: function (res) {
    wx.setNavigationBarColor({
      frontColor: cfg.frontColor,
      backgroundColor: cfg.backgroundColor,
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    });
  },
  markertap: function (e) {
    console.log("markertap click");
    console.log(e);
  },
  onLoad: function () {
    //保证wx.getSystemInfo的回调函数中能够使用this
    var that = this

    //构造百度地图api实例
    BMap = new bmap.BMapWX({
      ak: 'cPY4B8MAYgPQYOuDKPTNvUin31DBPDCB'
    })

    //调用wx.getSystemInfo接口，然后动态绑定组件高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight
        })
      }
    })
  },
  //查询当前位置的poi信息
  //官方文档上说可以查询指定位置的周边信息
  //然而当前源码中却存在一个bug导致不能查询指定位置的周边信息
  search: function (e) {

    var that = this

    //查询失败，直接打印log
    var fail = function (data) {
      console.log(data)
    }

    //查询成功后将结果数据动态绑定到页面上
    var success = function (data) {
      wxMarkerData = data.wxMarkerData;
      that.setData({
        markers: wxMarkerData
      })
      console.log(wxMarkerData);
      that.setData({
        latitude: wxMarkerData[0].latitude
      })
      that.setData({
        longitude: wxMarkerData[0].longitude
      })
    }

    //使用百度api查询周边信息
    //其中使用到了dataset属性
    BMap.search({
      query: e.target.dataset.type,
      success: success,
      fail: fail
    })
  }
})