<template>
  <form
    class="text-gray-800"
    @keydown.up.prevent.stop="up"
    @keydown.down.prevent.stop="down"
    @keydown.enter.prevent.stop="open"
  >
    <input class="w-full py-2 px-4 border-b border-gray-200 sticky top-0 z-10 focus:outline-none" type="text" autofocus placeholder="Search history..." v-model="search">
    <nav v-if="histories.length" ref="nav">
      <Item
        v-for="(history, index) in histories"
        :key="history.id"
        :search="search"
        :history="history"
        :hasFocus="index === focus"
        @focus="focus = index"
        @open="open"
      />
    </nav>
    <div ref="intersect" />
    <div v-if="loadingText" class="text-gray-500 py-2 px-4">
      {{ loadingText }}
    </div>
  </form>
</template>

<script>
import Item from './Item'

const debounce = (fn, wait = 1) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.call(this, ...args), wait)
  }
}

const INTERVALS = ['day', 'week', 'month', 'year']

export default {
  components: {
    Item,
  },
  data () {
    return {
      search: '',
      histories: [],
      focus: 0,
      interval: 'day',
      isInitialLoading: true,
      isLoading: true,
    }
  },
  computed: {
    focusedUrl() {
      return this.histories[this.focus].url
    },
    loadingText() {
      if (this.interval === INTERVALS[INTERVALS.length] && !this.isInitialLoading) {
        return
      }
      return `Loading previous ${this.interval}...`
    }
  },
  watch: {
    focus() {
      this.$nextTick(() => {
        this.$refs.nav.querySelector('.has-focus').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      })
    },
    search: debounce(function debounced() {
      this.interval = INTERVALS[0]
      this.queryHistory().then(() => {
        this.focus = 0
      })
    }, 300),
    isInitialLoading(isInitialLoading) {
      if (!isInitialLoading) {
        this.observer.observe(this.$refs.intersect)
      }
    }
  },
  mounted() {
    this.queryHistory()
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.isInitialLoading) {
        const index = INTERVALS.findIndex(i => i === this.interval)
        if (index < INTERVALS.length - 1) {
          this.interval = INTERVALS[index + 1]
          this.queryHistory()
        }
      }
    })
  },
  methods: {
    open(e) {
      if (e.metaKey || e.ctrlKey) {
        chrome.tabs.create({ url: this.focusedUrl })
        return
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: this.focusedUrl })
      })
    },
    up() {
      this.focus = this.focus === 0 ? this.histories.length - 1 : this.focus - 1
    },
    down() {
      this.focus = this.focus < this.histories.length - 1 ? this.focus + 1 : 0
    },
    queryHistory() {
      this.isInitialLoading = true
      return new Promise((resolve, reject) => {
        const startTime = new Date()
        if (this.interval === 'day') {
          startTime.setDate(startTime.getDate() - 1)
        }
        if (this.interval === 'week') {
          startTime.setDate(startTime.getDate() - 7)
        }
        if (this.interval === 'month') {
          startTime.setMonth(startTime.getMonth() - 1)
        }
        if (this.interval === 'year') {
          startTime.setYear(startTime.getYear() - 1)
        }
        chrome.history.search({ text: this.search, maxResults: 0, startTime: startTime.getTime() }, histories => {
          this.histories = histories
          this.isInitialLoading = false
          this.isLoading = false
          resolve(histories)
        })
      })
    }
  }
}
</script>

<style src="../assets/tailwind.css">
