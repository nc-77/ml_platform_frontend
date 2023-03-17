import {defineStore} from 'pinia'
import {Graph} from "@antv/x6";

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
const graphStore = defineStore('graph', {
    state: () => {
        return {graph: Graph}
    },
})

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
const linerFormStore = defineStore('linerForm', {
    state: () => {
        return {formStates: new Map,}
    },
    actions: defaultActions
})
const predictFormStore = defineStore('predictForm', {
    state: () => {
        return {formStates: new Map,}
    },
    actions: defaultActions
})
const evalLinearFormStore = defineStore('evalLinearForm', {
    state: () => {
        return {formStates: new Map,}
    },
    actions: defaultActions
})
export {graphStore, readCsvFormStore, splitFormStore, linerFormStore, predictFormStore, evalLinearFormStore}