from rest_framework import generics
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import DetalleDocumento
from .serializers import DetalleDocumentoSerializer


class DetalleDocumentoListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = DetalleDocumentoSerializer


    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='producto',
                description='Buscar producto por nombre',
                required=False,
                type=str
            ),

            OpenApiParameter(
                name='operacion',
                description='Filtrar por COMPRA o VENTA',
                required=False,
                type=str
            ),
        ]
    )
    def get(self, request, *args, **kwargs):

        return super().get(
            request,
            *args,
            **kwargs
        )


    def get_queryset(self):

        queryset = (
            DetalleDocumento.objects
            .select_related(
                'producto',
                'documento',
                'documento__cliente',
                'documento__proveedor'
            )
            .all()
            .order_by(
                '-documento__fecha',
                '-id'
            )
        )


        producto = self.request.query_params.get(
            'producto'
        )


        if producto:

            queryset = queryset.filter(
                producto__nombre__icontains=producto
            )


        operacion = self.request.query_params.get(
            'operacion'
        )


        if operacion:

            queryset = queryset.filter(
                documento__operacion__iexact=operacion
            )


        return queryset


class DetalleDocumentoDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = (
        DetalleDocumento.objects
        .select_related(
            'producto',
            'documento',
            'documento__cliente',
            'documento__proveedor'
        )
    )

    serializer_class = DetalleDocumentoSerializer