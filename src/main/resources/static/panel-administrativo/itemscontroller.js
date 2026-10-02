export class ItemGenerator {
    /*
    La clase ItemGenerator es creada para el manejo de los productos por una sola entidad centralizada. 
    Tiene dos propiedades: items (un arreglo de objetos con los productos) y currentId (una variable para guardar el estado del contador)
    El constructor puede recibir o no un parámetro Id en el constructor, por default comienza en 0.
    
    addItem(product) está diseñado para recibir un objeto con las propiedades del producto, que son:
    -"name"
    -"descripcion"
    -"numeroDePersonas"
    -"relleno"
    -"cobertura"
    -"pan"
    -"img"
    -"precio"
    "createdAt"
    Y agrega el objeto al final del arreglo items.


    getItems() retorna todos los objetos contenidos en el arreglo items.

    hasRequiredProperties(product) recibe un objeto json y verifica que el objeto tenga las propiedades requeridas.
    */


    items;
    currentId;
    isComplete = false;


    constructor(currentId = 0) {
        this.items = [];
        this.currentId = currentId;
    }

    hasRequiredProperties(product) {
        const requiredProperties = ["NombreProducto", "Descripcion", "Relleno", "Cobertura", "Pan", "Precio", "NumeroPersonas", "img", "createdAt"];
        let isProductComplete = true;

        if (product.createdAt == null) {
            product.createdAt = new Date().toISOString().split("T")[0];
        }

        requiredProperties.forEach(property => {
            // Revisa que las propiedades existan, y que no esten en blanco
            if (Object.hasOwn(product, property) == false || product[property] == false) {
                isProductComplete = false;
            }
        })

        return isProductComplete;
    }

    addItem(product) {
        this.isComplete = this.hasRequiredProperties(product);

        if (this.isComplete) {
            product.id = this.currentId;
            this.items.push(product);
            this.currentId++;
        } else {
            console.log("Product not complete!");
        }
        return this.isComplete;
    }

    getItems() {
        return this.items;
    }

    isProductComplete() {
        return this.isComplete;
    }

}