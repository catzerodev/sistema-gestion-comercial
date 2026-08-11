from django.db import models


class Cliente(models.Model):
    razon_social = models.CharField(max_length=150)
    ruc = models.CharField(max_length=11, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(max_length=150, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clientes'

    def __str__(self):
        return self.razon_social