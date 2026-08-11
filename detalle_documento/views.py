from rest_framework import generics
from .models import DetalleDocumento
from .serializers import DetalleDocumentoSerializer


class DetalleDocumentoListCreateView(generics.ListCreateAPIView):
    queryset = DetalleDocumento.objects.all()
    serializer_class = DetalleDocumentoSerializer


class DetalleDocumentoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DetalleDocumento.objects.all()
    serializer_class = DetalleDocumentoSerializer