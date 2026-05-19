// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

type IData = {
  openId: string,
  bindUserFederateCode: string | null,
  federatePhones: {
    phone: string,
    phoneMask: string,
    federateCode: string
  }[],
  errorMsg: string | null
}

Component<IData, any, any>({
  data: {
    openId: 'Hello World',
    bindUserFederateCode: null,
    federatePhones: [],
    errorMsg: null
    // userInfo: {
    //   avatarUrl: defaultAvatarUrl,
    //   nickName: '',
    // },
    // hasUserInfo: false,
    // canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    // canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },

  methods: {
    onLoad: function () {
      const loginStatus = wx.getStorageSync('loginStatus');
      if (loginStatus && loginStatus.phone && loginStatus.token) {
        console.log('navigateToStatus: ' + JSON.stringify(loginStatus))
        wx.navigateTo({
          url: '../logs/logs',
          success: res => {
            console.log('navigateTo success' + res)
          },
          fail: function (e) {
            console.log('navigateTo fail: ' + JSON.stringify(e))
          }
        });
        return;
      }
      // 登录
      wx.login({
        success: res => {
          console.log('Code get from wechat is: ' + res.code)
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          const iamClientPrimaryId = '0a2a002d-9007-16ea-8190-19fecb390003';
          const url = 'https://iam.shuhenglianchang.com/federation/wechat/miniapp/profile';
          wx.request({
            url: url,
            method: 'GET', // 可选，默认为 GET
            data: {
              clientPrimaryId: iamClientPrimaryId,
              code: res.code
            }, // 可选
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: res => {
              console.log(res.data)
              const loginData: any = res.data;
              if (loginData) {
                wx.setStorageSync('profile', loginData)
                const profile = wx.getStorageSync('profile');
                console.log('profile : ' + JSON.stringify(profile))
                if (profile && profile.data && profile.data.federateIdentities) {
                  const identities = profile.data.federateIdentities;
                  const phones: {
                    phone: string,
                    phoneMask: string,
                    federateCode: string
                  }[] = [];
                  let bindUserFederateCode = null;
                  identities.forEach((identity: any) => {
                    //console.log('federateCodeType: ' + identity.federateCodeType)
                    if (identity.federateCodeType == 'Token') {
                      phones.push({
                        phone: identity.user.username,
                        phoneMask: identity.user.username.substring(0, 3) + '*******',
                        federateCode: identity.federateCode
                      });
                    } else if (identity.federateCodeType == 'UserBind') {
                      bindUserFederateCode = identity.federateCode;
                    }
                  });
                  console.info('bindUserFederateCode: ' + bindUserFederateCode);
                  console.info('phones: ' + JSON.stringify(phones));
                  const data = this.data;
                  data.openId = profile.data.openid;
                  data.federatePhones = phones;
                  data.bindUserFederateCode = bindUserFederateCode;
                  this.setData(data);
                }

              }
            },
            fail: err => {
              console.error(err)
              const data = this.data;
              data.errorMsg = JSON.stringify(err);
              this.setData(data);
            }
          })
        },
      })
    },

    getPhoneNumber(e: any) {
      console.log(e.detail.code)  // 动态令牌
      console.log(e.detail.errMsg) // 回调信息（成功失败都会返回）
      console.log(e.detail.errno)  // 错误码（失败时返回）
      const iamClientPrimaryId = '0a2a002d-9007-16ea-8190-19fecb390003';
      const url = 'https://iam.shuhenglianchang.com/federation/wechat/miniapp/bindUser';
      const data = this.data;
      if (e.detail.code) {
        console.info('clientPrimaryId: ' + iamClientPrimaryId);
        console.info('federateCode: ' + data.bindUserFederateCode);
        console.info('code: ' + e.detail.code);
        wx.request({
          url: url,
          method: 'POST', // 可选，默认为 GET
          data: {
            clientPrimaryId: iamClientPrimaryId,
            federateCode: data.bindUserFederateCode,
            code: e.detail.code
          }, // 可选
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 默认值
          },
          success: res => {
            console.log(res.data)
            const resData: any = res.data;
            if (resData.errors) {
              console.error(resData)
              const data = this.data;
              data.errorMsg = JSON.stringify(resData);
              this.setData(data);
            }
          },
          fail: err => {
            console.error(err)
            const data = this.data;
            data.errorMsg = JSON.stringify(err);
            this.setData(data);
          }
        })
      }
    },

    onSignIn(e: any) {
      console.log('onSignIn: ' + e.currentTarget.dataset['index'])
      const federateCode = this.data.federatePhones[e.currentTarget.dataset['index']].federateCode;
      const phone = this.data.federatePhones[e.currentTarget.dataset['index']].phone;
      console.log('federateCode: ' + federateCode);
      console.log('phone: ' + phone);
      const url = 'https://iam.shuhenglianchang.com/oauth2/token';
      wx.request({
        url: url,
        method: 'POST', // 可选，默认为 GET
        data: {
          grant_type: 'urn:ietf:params:oauth:grant-type:federation:six-wechat-miniapp',
          assertion: federateCode
        }, // 可选
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: res => {
          console.log(res.data)
          const resData: any = res.data;
          if (resData && resData['access_token']) {
            const loginStatus = {
              phone: phone,
              phoneMask: phone.substring(0, 3) + '*******',
              token: res.data
            }
            wx.setStorageSync('loginStatus', loginStatus);
            this.onLoad()
          } else {
            const data = this.data;
            data.errorMsg = JSON.stringify(resData);
            this.setData(data);
          }
        },
        fail: err => {
          console.error(err)
          const data = this.data;
          data.errorMsg = JSON.stringify(err);
          this.setData(data);
        }
      })


    },

    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
  },
})
