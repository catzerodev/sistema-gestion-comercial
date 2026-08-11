from django.db import models
from documentos.models import Documento
from productos.models import Producto


class DetalleDocumento(models.Model):
    documento = models.ForeignKey(
        Documento,
        on_delete=models.CASCADE
    )

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT
    )

    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'detalle_documento'

    def __str__(self):
        return f"{self.documento} - {self.producto}"