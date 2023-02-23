import {defineStore} from 'pinia'

const defaultActions = {
    getFormStateById(id) {
        if (!this.formStates.has(id)) {
            return null;
        }
        return this.formStates.get(id);
    },
    setFormStateById(id, formState) {
        this.formStates.set(id, formState);
    }
}

const readCsvFormStore = defineStore('readCsvForm', {
    state: () => {
        return {formStates: new Map,}
    },
    actions: defaultActions
})
const splitFormStore = defineStore('splitForm', {
    state: () => {
        return {formStates: new Map,}
    },
    actions: defaultActions
})

export {readCsvFormStore, splitFormStore}