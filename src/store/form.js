import {defineStore} from 'pinia'

export const readCsvFormStore = defineStore('readCsvForm', {
    state: () => {
        return {
            formStates: new Map,
        }
    },
    actions: {
        getFormStateById(id) {
            if (!this.formStates.has(id)) {
                return null;
            }
            return this.formStates.get(id);
        },
        setFormStateById(id, formState) {
            this.formStates.set(id, formState);
        }
    },
})