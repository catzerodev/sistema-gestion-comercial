from rest_framework import serializers
from .models import DetalleDocumento


class DetalleDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleDocumento
        fields = '__all__'