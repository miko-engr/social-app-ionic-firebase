import {Component} from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {PostPage} from "../post/post";
import {PostProvider} from "../../providers/post/post";
import {FavoritesProvider} from "../../providers/favorites/favorites";
import firebase from "firebase";
import {PostEditComponent} from "../../components/post-edit/post-edit";

/**
 * Generated class for the GroupsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html',
})
export class GroupsPage {
  myFeed;

  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events, public postService: PostProvider, public favoritesService: FavoritesProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupsPage');
  }

  ionViewWillEnter() {
    this.postService.getAll();
    this.events.subscribe('posts', () => {
      this.myFeed = this.postService.myFeed;
      this.myFeed.map(post => {
        this.isItFavoritedByMe(post)
      })
    })
  }

  onAddPost() {
    console.log("test");
    this.navCtrl.push(PostPage)
  }

  isItFavoritedByMe(post) {
    //loop throw the the post favorites and check if there is a user id equal to mine
    for (let location in post.favorites) {
      if (post.favorites[location].user_id == firebase.auth().currentUser.uid) {
        post.isFavoritedByMe = true;
      }
    }
  }

  markAsFavorite(item: any) {
    console.log(item.user.uid, item.uid);
    this.favoritesService.favorite(item.user.uid, item.uid).then((res: any) => {
      if (res.success) {
        console.log("success ");
        item.isFavoritedByMe = true;

      }
    }).catch((err) => {
      alert(err);
    })
  }

  markAsunFavorite(item) {
    console.log(item.user.uid, item.uid, item);

    this.favoritesService.unFavorite(item.user.uid, item.uid).then((res: any) => {
      if (res.success) {
        console.log("success ");
        item.isFavoritedByMe = false;

      }
    }).catch((err) => {
      alert(err);
    })
  }

  isItMine(item) {
    if (item.user.uid == firebase.auth().currentUser.uid) {
      return true;
    }
  }

  removePost(key: any) {
    console.log("here is the remove post method");
    this.postService.deletePost(key).then((res: any) => {
      if (res.success) {
        let deletedUser = 0;
        this.myFeed.forEach((item, position) => {
          if (item.uid == key) {
            return deletedUser = position;
          }
        });
        console.log("success ", this.myFeed, this.myFeed.indexOf(key), deletedUser);
        this.myFeed.splice(deletedUser, 1);
      }
    }).catch((err) => {
      alert(err);
    })
  }

  editPost(item: any) {
    this.navCtrl.push(PostEditComponent, {
      item: item
    });

  }

  viewPostDetails(item) {
    this.navCtrl.push('PostSinglePage', {
      post: item,
      post_id: item.uid,
      user_id: item.user.uid
    });
  }
}
