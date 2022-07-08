# Python 3 Style Guide

:zap: View the sidebar (right) for the rapid navigation.

:exclamation: We follow [PEP8 Guidelines](https://peps.python.org/pep-0008/#naming-conventions) and most of the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html). The below guidelines listed below.

## :guardsman: Formatters & Linters

Run [autopep8](https://pypi.org/project/autopep8/) and [Flake8](https://pypi.org/project/flake8/) prior to pushing code.

:exclamation: Flake8 will be run in CI (GitHub Workflows). Linting and formatting errors must be resolved prior merging a pull request.

## :speech_balloon: Naming Conventions

See [Google Style Guide Conventions](https://google.github.io/styleguide/pyguide.html#316-naming).

In short: ClassName, function_name, CONSTANT_NAME, ExceptionName, local_var_name

## :notebook_with_decorative_cover: Docstrings

"Docstrings" are comments containing critical information about classes and functions.

The following conventions for Python 3 docstrings shall be adhered to.

1. `class` docstrings should contain:
   - A description of the class
   - list of class attributes (initialization parameters)
2. function (`def`) docstrings should contain:
   - A description of the function's purpose
   - Arguments to the function
   - The expected return value (and type) of the function

*Example*:

```python
class ComplexNumber:
    """
    This is a class for mathematical operations on complex numbers.
      
    Attributes:
        real (int): The real part of complex number.
        imag (int): The imaginary part of complex number.
    """
  
    def __init__(self, real, imag):
        """
        The constructor for ComplexNumber class.
  
        Parameters:
           real (int): The real part of complex number.
           imag (int): The imaginary part of complex number.   
        """
  
    def add(self, num):
        """
        The function to add two Complex Numbers.
  
        Parameters:
            num (ComplexNumber): The complex number to be added.
          
        Returns:
            ComplexNumber: A complex number which contains the sum.
        """
  
        re = self.real + num.real
        im = self.imag + num.imag
  
        return ComplexNumber(re, im)
  
help(ComplexNumber)  # to access Class docstring
help(ComplexNumber.add)  # to access method's docstring
```
(*from [Geeks for Geeks](https://www.geeksforgeeks.org/python-docstrings/)*)

## :page_with_curl: License Boilerplate

Every file should start with a license boilerplate.

The license may vary from repository to repository.

Check with the `#legal` team if unclear which license to use.