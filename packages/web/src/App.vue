<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Alert, Button } from '@byteagent/ui'
</script>

<template>
  <RouterView />
  <Alert>Hello</Alert>
  <Button>Click me</Button>
</template>