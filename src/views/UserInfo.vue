<template>
  <h1>UserInfo {{ id }}</h1>
  <a-button @click=logout>Log out</a-button>
</template>

<script>
export default {
  name: "UserInfo",
  props: ["id"],
  methods:{
    logout(){
      localStorage.clear();
      this.$router.push("/login");
    }
  }
}
</script>

<style scoped>

</style>