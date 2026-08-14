from django.db import models
from clientes.models import Cliente
from proveedores.models import Proveedor


class Documento(models.Model):

    OPERACION_CHOICES = [
        ('COMPRA', 'Compra'),
        ('VENTA', 'Venta'),
    ]

    tipo = models.CharField(
        max_length=20,
        default='FACTURA'
    )

    numero = models.CharField(
        max_length=30
    )

    fecha = models.DateField()

    moneda = models.CharField(
        max_length=3,
        default='PEN'
    )

    operacion = models.CharField(
        max_length=10,
        choices=OPERACION_CHOICES,
        default='COMPRA'
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    archivo = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    created_by_id = models.BigIntegerField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:
        db_table = 'documentos'


    def __str__(self):
        return f"{self.tipo} - {self.numero}"