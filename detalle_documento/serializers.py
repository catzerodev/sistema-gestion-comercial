from rest_framework import serializers
from .models import DetalleDocumento


class DetalleDocumentoSerializer(serializers.ModelSerializer):

    producto_nombre = serializers.CharField(
        source='producto.nombre',
        read_only=True
    )

    documento_numero = serializers.CharField(
        source='documento.numero',
        read_only=True
    )

    documento_fecha = serializers.DateField(
        source='documento.fecha',
        read_only=True
    )

    documento_operacion = serializers.CharField(
        source='documento.operacion',
        read_only=True
    )

    documento_moneda = serializers.CharField(
        source='documento.moneda',
        read_only=True
    )

    proveedor_nombre = serializers.CharField(
        source='documento.proveedor.razon_social',
        read_only=True
    )

    cliente_nombre = serializers.CharField(
        source='documento.cliente.razon_social',
        read_only=True
    )


    class Meta:

        model = DetalleDocumento

        fields = [
            'id',
            'documento',
            'producto',
            'cantidad',
            'precio_unitario',

            'producto_nombre',

            'documento_numero',
            'documento_fecha',
            'documento_operacion',
            'documento_moneda',

            'proveedor_nombre',
            'cliente_nombre',
        ]