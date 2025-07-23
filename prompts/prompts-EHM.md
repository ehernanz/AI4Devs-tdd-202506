LLM: Sonnet 4
Prompt:
Eres un QA Developer muy experimentado.

El código está escrito en Typescript, por lo que quiero que usses ts-jest.

Y necesito generes una batería de test unitarios en Jest para la funcionalidad de insertar candidatos en base de datos.

Si en alguno de los tests es necesario modificar la base de datos, no escribas en la BBDD, tienes que mockearla para no alterar los datos. Puedes encontrar más información para este caso concreto en la documentación de prisma (https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client)

Te adjunto dos referencias sobre el trabajo que tienes que realizar:
- https://medium.com/@angelygranados/c%C3%B3mo-empezar-a-hacer-unit-testing-con-jest-gu%C3%ADa-b%C3%A1sica-ca6d9654672
- https://jestjs.io/es-ES/docs/getting-started

Necesito que el resutado lo escribas en el fichero "tests-EHM.test.ts" en la ruta "/prompts"