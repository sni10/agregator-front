import { computed, ref } from 'vue'
import { ApiError, errorMessage, fieldErrors } from '@/api'

// Form submit state: busy flag, per-field errors (400) and one general message for the rest.
export function useSubmit(fn: () => Promise<unknown>) {
  const busy = ref(false)
  const failure = ref<unknown>(null)
  const fields = computed(() => fieldErrors(failure.value))
  const error = computed(() => {
    const e = failure.value
    if (!e || Object.keys(fields.value).length) return ''
    if (e instanceof ApiError && e.status === 401) return 'Wrong email or password.'
    return errorMessage(e)
  })

  async function submit() {
    if (busy.value) return
    busy.value = true
    failure.value = null
    try {
      await fn()
    } catch (e) {
      failure.value = e
    } finally {
      busy.value = false
    }
  }

  return { busy, fields, error, failure, submit }
}
