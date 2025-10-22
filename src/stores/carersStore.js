import { defineStore } from 'pinia'

export const useCarersStore = defineStore('carers', {
    state: () => ({
        carer: [
            { id: 1, name: "Carlos", lastName: "Díaz", email: "carlos@email.com"},
            { id: 2, name: "Juan", lastName: "Perez", email: "juan@email.com" }
        ]
    }),
    actions: {
        getCarer(id){
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
            return `"https://randomuser.me/api/portraits/`+gender+`/`+id+`.jpg"`;
        }
    }
})