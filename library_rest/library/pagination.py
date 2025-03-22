from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class LibraryPagination(PageNumberPagination):
    page_size = 6  # Default page size
    page_size_query_param = 'page_size'  # Allow clients to set page size
    max_page_size = 100  # Maximum page size allowed

    def get_paginated_response(self, data):
        return Response({
            'total_records': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
