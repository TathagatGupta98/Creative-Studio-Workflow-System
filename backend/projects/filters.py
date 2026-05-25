import django_filters

from .models import Task


class TaskFilter(django_filters.FilterSet):
    tag = django_filters.CharFilter(field_name='tags__name', lookup_expr='iexact')

    class Meta:
        model = Task
        fields = ['tag']
