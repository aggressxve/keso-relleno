export class AlertThrower {
    isSuccessful;
    successAlert = `<div class="alert alert-success" role="alert" tabindex="-1">Producto guardado correctamente!</div>`;
    errorAlert = `<div class="alert alert-warning" role="alert" tabindex="-1">El producto no puede ser guardado!</div>`;

    constructor(operationResult) {
        this.isSuccessful = operationResult;
    }

    throwAlert() {
        let target = document.getElementById("liveAlertPlaceholder");
        target.innerHTML = this.isSuccessful ? this.successAlert : this.errorAlert;

        target.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        target.focus();
    }


}