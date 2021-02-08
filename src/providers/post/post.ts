import {Injectable} from '@angular/core';
import firebase from "firebase";
import {Events} from "ionic-angular";
import {UserProvider} from "../user/user";
import {FollowProvider} from "../follow/follow";
import {ImghandlerProvider} from "../imghandler/imghandler";
import {NotificationsProvider} from "../notifications/notifications";

/*
  Generated class for the PostProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PostProvider {
  firereq = firebase.database().ref('/posts');
  myFeed;

  constructor(public events: Events, public userService: UserProvider, public followService: FollowProvider, public imgHandlerService: ImghandlerProvider, public notificationService: NotificationsProvider) {
    console.log('Hello PostProvider Provider');
  }

  async getAll() {

    // should get all people this user follows
    let peopleIfollow = await this.followService.getAllPeopleThatIFollow();
    this.myFeed = await this.getAllPostsForPeopleILike(peopleIfollow);
    // console.log("Here is your feed", this.myFeed);
    this.events.publish('posts');





  }

  getPostsAssiciatedWithOnePerson(personKey) {
    return new Promise((resolve, reject) => {
      this.firereq.child(personKey).once('value', s => {
        console.log(s.val());
        let result = s.val();
        resolve(result);
      })
    })
  }

  getSpecificPostForUser(user_id, post_id) {
    return new Promise((resolve, reject) => {
      this.firereq.child(user_id).child(post_id).once('value', s => {
        resolve(s.val());
      })
    });

  }

  async getAllPostsForPeopleILike(peopleIfollow) {
    let posts = [];
    for (let location in peopleIfollow) {
      let postsByThisUser = await this.getPostsAssiciatedWithOnePerson(peopleIfollow[location]);
      for (let post in postsByThisUser) {
        console.log("Here is the post id ", post);
        postsByThisUser[post].uid = post;
        postsByThisUser[post].user = await this.userService.getuserdetails(peopleIfollow[location]);
        postsByThisUser[post].user.photoURL = await this.imgHandlerService.getAuserImage(postsByThisUser[post].user.uid);
        posts.push(postsByThisUser[post]);
      }
    }

    console.log("Here is after", posts);
    return posts;
  }

  addPost(post) {
    return new Promise((resolve, reject) => {
      post.created_at = firebase.database.ServerValue.TIMESTAMP;
      this.firereq.child(firebase.auth().currentUser.uid).push(post).then((item) => {
        this.notificationService.notifyFollowers(item.key);
        resolve({success: true});
      })
    });
  }

  deletePost(uid) {
    return new Promise((resolve, reject) => {
      this.firereq.child(firebase.auth().currentUser.uid).child(uid).remove().then(() => {
        resolve({success: true});
      })
    });
  }

  updatePost(uid: string, value: any) {
    return new Promise((resolve, reject) => {
      this.firereq.child(firebase.auth().currentUser.uid).child(uid).update(value).then(() => {
        resolve({success: true});
      }).catch((err) => {
        reject(err);
      })
    })
  }
}
