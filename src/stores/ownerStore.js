import { defineStore } from 'pinia'

export const useOwnerStore = defineStore('owners', {
    state: () => ({
        owners: [
            { id: 1, name: "Jazmín", lastName: "Pavón", email: "jaz@email.com", photo: "https://randomuser.me/api/portraits/women/1.jpg"},
            { id: 2, name: "Eliana", lastName: "Sánchez", email: "eli@email.com", photo: "https://randomuser.me/api/portraits/women/2.jpg" },
            { id: 2, name: "Maria", lastName: "Gimenez", email: "maria@email.com", photo: "https://randomuser.me/api/portraits/women/3.jpg" }
        ]
    }),
    actions: {
        getAllOwners(){
            return this.owners;
        },
        getOwnerById(id){
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