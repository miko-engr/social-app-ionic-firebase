import {Component, NgZone} from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {ImghandlerProvider} from '../../providers/imghandler/imghandler';
import {UserProvider} from '../../providers/user/user';
import firebase from 'firebase';

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  avatar;
  displayName: string;
  user: any;
  editable = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public userservice: UserProvider, public zone: NgZone, public alertCtrl: AlertController,
              public imghandler: ImghandlerProvider, public loadingCtrl: LoadingController) {
    this.user = navParams.get('user');
    console.log(this.user, "test00");
    if (this.user) {
      this.editable = false
    }
    console.log("User is ", this.user);
  }

  ionViewWillEnter() {
    if (!this.user) {
      this.loaduserdetails();
    } else {
      this.setUserDetails(this.user)
    }
  }

  loaduserdetails() {
    this.userservice.getuserdetails().then((res: any) => {
      res.uid = firebase.auth().currentUser.uid;
      this.setUserDetails(res);

    })
  }

  setUserDetails(user) {
    this.displayName = user.displayName;
    this.imghandler.getAuserImage(user.uid).then(imgUrl => {
      this.avatar = imgUrl;
    });
  }

  editimage() {
    let loader = this.loadingCtrl.create({
      content: 'Please wait'
    });
    loader.present();
    let statusalert = this.alertCtrl.create({
      buttons: ['okay']
    });
    this.imghandler.uploadimage().then((url: any) => {
      this.userservice.updateimage(url).then((res: any) => {
        if (res.success) {
          loader.dismiss();

          statusalert.setTitle('Updated');
          statusalert.setSubTitle('Your profile pic has been changed successfully!!');
          statusalert.present();
          this.zone.run(() => {
            this.avatar = url;
          })
        }
      }).catch((err) => {
        loader.dismiss();
        statusalert.setTitle('Failed');
        statusalert.setSubTitle('Your profile pic was not changed');
        statusalert.present();
      })
    })
  }

  editname() {
    let statusalert = this.alertCtrl.create({
      buttons: ['okay']
    });
    let alert = this.alertCtrl.create({
      title: 'Edit Nickname',
      inputs: [{
        name: 'nickname',
        placeholder: 'Nickname'
      }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: data => {

        }
      },
        {
          text: 'Edit',
          handler: data => {
            if (data.nickname) {
              this.userservice.updatedisplayname(data.nickname).then((res: any) => {
                if (res.success) {
                  statusalert.setTitle('Updated');
                  statusalert.setSubTitle('Your nickname has been changed successfully!!');
                  statusalert.present();
                  this.zone.run(() => {
                    this.displayName = data.nickname;
                  })
                } else {
                  statusalert.setTitle('Failed');
                  statusalert.setSubTitle('Your nickname was not changed');
                  statusalert.present();
                }

              })
            }
          }

        }]
    });
    alert.present();
  }

  logout() {
    firebase.auth().signOut().then(() => {
      this.navCtrl.parent.parent.setRoot('LoginPage');
    })
  }


}
