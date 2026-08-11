from django.db import models


class Producto(models.Model):
    codigo = models.CharField(max_length=50, blank=True, null=True)
    nombre = models.CharField(max_length=200)
    marca = models.CharField(max_length=100, blank=True, null=True)
    unidad = models.CharField(max_length=30)
    descripcion = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'productos'

    def __str__(self):
        return self.nombre