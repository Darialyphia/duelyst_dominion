<script setup lang="ts">
onMounted(() => {
  const main = document.getElementById('test-board')!;

  const cols = 9;
  const rows = 5;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const cell = document.createElement('div');
      cell.style.setProperty('--x', `${x}`);
      cell.style.setProperty('--y', `${y}`);
      main.appendChild(cell);
    }
  }
});
</script>

<template>
  <main id="test-board"></main>
</template>

<style lang="postcss">
#test-board {
  position: absolute;
  left: 50%;
  --cell-size: 96px;
  width: calc(9 * var(--cell-size));
  height: calc(5 * var(--cell-size));
  outline: solid 1px red;
  transform: rotateX(15deg);

  --board-angle-X: 20deg;
  /* top: var(--size-11); */
  /* left: 50%; */
  /* transform: rotateX(var(--board-angle-X)); */
  transform-style: preserve-3d;

  div {
    position: absolute;
    width: 96px;
    height: 96px;
    background: #444;
    transform: translateZ(0.1px);
    will-change: transform;
    translate: calc(var(--cell-size) * var(--x))
      calc(var(--cell-size) * var(--y));
    &:hover {
      background: #666;
    }
  }
}
</style>
