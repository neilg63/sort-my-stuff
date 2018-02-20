<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <section class="user-panel">
      <div v-if="userLoggedIn" class="info-panel">
        <p>Logged in as {{user.name}} <a href="#" v-on:click.prevent="logOut()" class="logout">Log out</a></p>
      </div>
      <form v-else method="post" id="user-login-form" v-on:submit.prevent="logIn()">
        <p>
          <input v-if="registerMode" name="name" id="login-name" type="text" minlength="3" placeholder="Enter your name" v-model="user.name" />
          <input name="email" id="login-email" type="email" placeholder="Enter your email" v-model="user.email" pattern="[a-zA-Z0-9;,._]" title="Only use plain letters, numbers and simple punctuation marks (;,._)" />
          <label for="login-password">Password</label>
          <input name="password" id="login-password" type="password" v-model="user.password" />
          <input v-if="!registerMode" value="Sign in" id="login-submit" type="submit" v-on:click.prevent="logIn()" />
          <input value="Register" id="login-register" type="submit" v-on:click.prevent="register()" />
          <p v-if="!userLoggedIn" class="message">{{user.message}}</p>
        </p>
      </form>

    </section>
    <section class="stuff-panel" v-if="userLoggedIn">
      <category :lists="lists" depth="0" catId="0" catName="Parent" numItems="0" :numSubs="lists.length"></category>
    </section>
    <div id="toast-container" :class="{visible: toast.show}">
        <h4>{{toast.message}}</h4>
      </div>
  </div>
</template>

<script>
const axios = require('axios');
const _ = require('lodash');
import Category from './components/Category.vue';

export default {
  name: 'app',
  data () {
    return {
      title: 'Sort My Stuff',
      userLoggedIn: false,
      registerMode: false,
      user: {
        id: 0,
        email: "",
        password: "",
        name: "",
        message: ""
      },
      toast: {
        show: false,
        message: ""
      },
      lists: []
    }
  },
  components: {
    Category
  },
  created() {
    let comp = this;
    let storedUser = this.$ls.get('user');
    if (_.isObject(storedUser) && storedUser.valid) {
      this.user = storedUser;
      if (this.user.roleId > 0) {
        this.userLoggedIn = true;
        this.loadStuff();
      }
    }

    let socket = io.connect();
    socket.on('connect', () => {
      this.$bus.$emit('connected', true)
    });

    socket.on('join', (user) => {
      this.$bus.$emit('join',user);
    });

    socket.on('leave', (user) => {
      this.$bus.$emit('leave',user);
    });
    socket.on('update', (data) => {
      if (data.newItem) {
          let msg = "";
          switch(data.action) {
            case "created":
              msg = `New ${data.type} created:`;
              break;
            case "deleted":
            case "moved":
            case "edited":
              msg = `${data.type} ${data.action}:`;
              break;
          }
          if (data.newItem) {
            if (data.newItem.name) {
              msg += ' ' +  data.newItem.name;
            }
          }
          comp.toast.show = true;
          comp.toast.message = msg;
          setTimeout(() => {
            comp.toast.show = false;
          },5000); 
       }
      comp.$bus.$emit('other-update',data);
    });

    this.$bus.$on('stuff-update',(data) => {
      if (data && data.stuff) {
        if (data.stuff instanceof Array) {
          this.lists = data.stuff;
          socket.emit('update', data);
        }
      }
    });
    this.$bus.$on('other-update',(data) => {
      if (data && data.stuff) {
        if (data.stuff instanceof Array) {
          if (data.userId != this.user.id) {
            this.lists = data.stuff;
          }
        }
      }
    });
  },
  methods: {
    logIn() {
      let comp = this;
      axios.post('/api/login',this.user).then(response => {
          this.user = response.data;
          if (response.data.valid) {
            this.userLoggedIn = true;
            comp.loadStuff();
            comp.$ls.set('user', response.data);
          }
      }).catch(error => console.log(error));
    },
    logOut() {
      this.user.valid = false;
      this.user.name = '';
      this.user.email = '';
      this.user.roleId = 0;
      this.user.roleName = '';
      this.$ls.set('user',this.user);
      this.userLoggedIn = false;
    },
    register() {
      if (this.registerMode && this.user.name.length > 3 && this.user.email.length > 5 && this.user.password.length > 5) {
        this.user.roleId = 3;
        let comp = this;
        axios.post('/api/register', this.user)
          .then(response => {
            if (response.data.valid) {
              comp.userLoggedIn = true;
              comp.user = response.data;
              comp.loadStuff();
              comp.$ls.set('user', response.data);
            } else {
              comp.registerMode = true;
              if (response.data.message) {
                comp.user.password = "";
                comp.user.message = response.data.message;
              }
            }
          })
          .catch(error => console.log(error));
      }
      this.registerMode = !this.registerMode;
    },
    loadStuff() {

      axios.get('/api/index/' + this.user.id).then(response => {
          if (response.data.valid) {
            if (response.data.stuff instanceof Array) {
              this.lists = response.data.stuff;
            }
          }
      }).catch(error => console.log(error));
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 1em;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 1em;
}

a {
  color: #42b983;
}

.stuff-panel .categories .category {
  clear: both;
  display: block;
  padding: 0.5em 0.5em 2em 0.5em;
  margin: 0.75em 1em 1.5em 1em;
  cursor: pointer;
  border: solid 1px #999999;
  border-radius: 1em;
  background-color: #ffffcc;
  min-height: 4em;

  h3 {
    position: relative;
  }

  h3 input {
    font-size: 1em;
  }

  h3 input.category-name {
    position: relative;
    border: none;
    background: none;
    transition: background 0.25s ease-in-out;
    left: 2em;
    border: solid 1px transparent;
    text-align: center;
  }

  h3 input.edit {
    opacity: 0;
    font-size: 0.5em;
    width: 3em;
    margin-left: 4em;
    transition: opacity 0.25s ease-in-out;
  }

  h3:hover input.category-name {
    background: white;
    border: solid 1px #ddddff;
  }

  h3:hover input.edit {
    opacity: 1;
  }

}

.stuff-panel .categories {
  min-height: 6em;
  margin: 1em;
}

.stuff-panel .categories ol {

  li.item {
    position: relative;
    padding: 0.5em;
    margin: 0 .5em 1em 0.5em;
    border-radius: 0.25em;
    background-color: #ffccff; 
    h4 {
      margin: 0;
      padding: 0 0.5em;
    } 
  }
  
  .delete-item {
    opacity: 0;
    transition: opacity 0.25s ease-in-out;
    position: absolute;
    top: -0.25em;
    font-size: 1.25em;
    left: -0.125em;
    margin: 0;
    padding: 0 0.25em;
    line-height: 1em;
    background-color: red;
  }

  li.item:hover .delete-item {
    opacity: 1;
  }
}

.stuff-panel .categories li .categories {
  border: dashed 1px #aaaaaa;
  border-radius: 1em;
}

.stuff-panel .categories .category:hover {
  background-color: yellow;
}

.stuff-panel .categories .category.dragging {
  background-color: #99ffcc;
}

.stuff-panel .category-group {
  clear: both;
  position: relative;
}

.stuff-panel .add-form,
.stuff-panel .category-control {
  position: absolute;
}

.stuff-panel {
  .category-control {
    opacity: 0;
    transition: opacity 0.25s ease-in-out;
  }
  li.category:hover .category-control {
    opacity: 1;
  }
}

.stuff-panel .category-control {
  font-size: 1.5em;
  top: -1.5em;
  border-radius: 1em;
  padding: 0.125em 0.375em;
  line-height: 1em;
}

.stuff-panel .add-category {
  right: 0.25em;
  background-color: #ffff99;
}

.stuff-panel .delete-category {
  right: 4em;
  background-color: #ff0000;
}

.stuff-panel .add-item {
  right: 2em;
  background-color: #ffccff;
}

.stuff-panel .add-form {
  top: 0;
  right: 4em;
  padding: 0.5em;
  background-color: white;
}

.stuff-panel .add-form input {
  font-size: 1.25em;
}

.user-panel .logout {
  display: inline-block;
  margin-left: 2em;
}

#toast-container {
  position: fixed;
  top: 20%;
  left: 25%;
  right: 25%;
  text-align: center;
  background-color: white;
  border: solid 1px #999999;
  border-radius: 0.15em;
  padding: 1em;
  opacity: 0;
  pointer-events: none;
  transition: opacity 1s ease-in-out;
}

#toast-container.visible {
  opacity: 1;
  pointer-events: all;
}

</style>
