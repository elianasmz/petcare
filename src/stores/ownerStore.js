import { defineStore } from 'pinia'

export const useOwnerStore = defineStore('owners', {
    state: () => ({
        owners: [
            { id: 1, name: "Jazmín", lastName: "Pavón", email: "jaz@email.com"},
            { id: 2, name: "Eliana", lastName: "Sánchez", email: "eli@email.com" }
        ]
    }),
    actions: {
        getOwner(id){
            return this.owners.find(owner => owner.id === id);
        },
        getOwnerName(id){
            return this.owners.find(owner => owner.id === id)?.name || 'Desconocido';
        },
        getOwnerLastName(id){
            return this.owners.find(owner => owner.id === id)?.lastName || 'Desconocido';
        }
    }
})