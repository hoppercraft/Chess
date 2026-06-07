from rest_framework.views     import exception_handler
from rest_framework.response  import Response
from rest_framework           import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        # Normalise all error responses to { message, errors? }
        data    = response.data
        message = 'An error occurred.'

        if isinstance(data, dict):
            if 'detail' in data:
                message = str(data['detail'])
                response.data = {'message': message}
            else:
                # Validation errors — flatten first message for display
                first = next(iter(data.values()), None)
                if isinstance(first, list) and first:
                    message = str(first[0])
                response.data = {'message': message, 'errors': data}
        elif isinstance(data, list) and data:
            message = str(data[0])
            response.data = {'message': message}

    return response