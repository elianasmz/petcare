import { defineStore } from 'pinia'

export const useCarersStore = defineStore('carers', {
    state: () => ({
        carer: [
            { id: 1, name: "Carlos", lastName: "Díaz", email: "carlos@email.com", photo: "https://randomuser.me/api/portraits/men/1.jpg"},
            { id: 2, name: "Juan", lastName: "Perez", email: "juan@email.com", photo: "https://randomuser.me/api/portraits/men/2.jpg" },
            { id: 3, name: "Pedro", lastName: "Torrez", email: "pedro@email.com", photo: "https://randomuser.me/api/portraits/men/3.jpg" }
        ]
    }),
    actions: {
        getAllCarers(){
            return this.carer;
        },
        getCarerById(id){
            return this.carer.find(owner => owner.id === id);
        },
        getCarerName(id){
            return this.carer.find(owner => owner.id === id)?.name || 'Desconocido';
        },
        getCarerLastName(id){
            return this.carer.find(owner => owner.id === id)?.lastName || 'Desconocido';
        },
        getCarerEmail(id){
            return this.carer.find(owner => owner.id === id)?.email || 'Desconocido';
        },
        getCarerPhoto(id, gender){
            return this.carer.find(owner => owner.id === id)?.photo
        }
    }
})