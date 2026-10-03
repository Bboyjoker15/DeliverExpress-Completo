# Guía de estudio — Base de datos de DeliverExpress

Explicación de PL/pgSQL y triggers partiendo de lo que ya sabes (`CREATE TABLE`, `CONSTRAINT`, `SELECT`), usando el código real del proyecto (`database/*.sql`) en vez de ejemplos genéricos.

## Parte 1 — Las piezas nuevas que no conoces

### Una función es básicamente una consulta con esteroides

De `03_funciones_logistica.sql`:

```sql
CREATE OR REPLACE FUNCTION fn_distancia_km(
    p_lat1 DOUBLE PRECISION, p_lon1 DOUBLE PRECISION,
    p_lat2 DOUBLE PRECISION, p_lon2 DOUBLE PRECISION
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_radio_km CONSTANT DOUBLE PRECISION := 6371;
BEGIN
    ...
    RETURN ROUND((v_radio_km * v_c)::NUMERIC, 2);
END;
$$;
```

Léelo así, pieza por pieza:

- **`CREATE OR REPLACE FUNCTION nombre(parámetros)`** — como una receta con ingredientes. `p_lat1` es un parámetro de entrada; la convención del proyecto es que todos los parámetros empiezan con `p_` (así nunca se confunden con nombres de columnas de tabla).
- **`RETURNS NUMERIC`** — qué tipo de dato devuelve esta función cuando termina.
- **`LANGUAGE plpgsql`** — le dice a Postgres "esto no es una sola consulta SQL, es un mini-programa con variables y lógica".
- **`AS $$ ... $$`** — los `$$` son como comillas para strings larguísimos. Todo lo de adentro es el cuerpo de la función (se usan para no tener que escapar comillas internas).
- **`DECLARE`** — aquí defines "variables locales", cajitas donde guardas valores temporales mientras la función corre. `v_radio_km` es una variable; la convención es que las variables locales empiezan con `v_`.
- **`CONSTANT ... := 6371`** — `:=` es "asignar". `CONSTANT` dice que ese valor nunca cambia dentro de la función.
- **`BEGIN ... END;`** — el cuerpo real, lo que se ejecuta paso a paso, de arriba a abajo (a diferencia de un `SELECT` normal, donde no hay "pasos", solo una pregunta).
- **`RETURN`** — entrega el resultado final y termina la función ahí mismo.

**Si el profesor pregunta "¿por qué usan funciones y no ponen toda esta lógica en el backend (Python)?"**: la respuesta es que así la integridad vive en un solo lugar, protegida por el motor de base de datos, y no depende de que el programador del backend se acuerde de validar todo cada vez.

### Variables que vienen de una tabla: `SELECT ... INTO`

De `04_funciones_pedidos.sql`, dentro de `fn_cambiar_estado`:

```sql
DECLARE
    v_id_repartidor INT;
BEGIN
    SELECT id_repartidor INTO v_id_repartidor FROM pedido WHERE id_pedido = p_id_pedido;
```

Es un `SELECT` normal, pero en vez de devolver una tabla de resultados al cliente, el resultado (un solo valor, porque es un solo pedido) se guarda **dentro** de la variable `v_id_repartidor` para usarla más abajo. Esa es la diferencia clave entre "consultar" y "programar": ahora puedes guardar un resultado y tomar una decisión con él.

### Decisiones: `IF / ELSIF / END IF`

Misma función:

```sql
IF p_nuevo_estado = 4 THEN
    SELECT id_repartidor INTO v_id_repartidor FROM pedido WHERE id_pedido = p_id_pedido;
    IF v_id_repartidor IS NULL THEN
        RAISE EXCEPTION 'REPARTIDOR_NO_ASIGNADO: se intenta pasar a en_camino sin repartidor';
    END IF;
END IF;
```

Es el `if` de cualquier lenguaje de programación. Hay un `IF` dentro de otro `IF` ("anidados"). Siempre: `IF condición THEN ... END IF;` — el `END IF` es obligatorio.

### `RAISE EXCEPTION`: cómo la base de datos dice "no, esto no se puede"

```sql
RAISE EXCEPTION 'REPARTIDOR_NO_ASIGNADO: se intenta pasar a en_camino sin repartidor';
```

Esto **detiene toda la operación** (rollback automático) y lanza un error hacia quien llamó la función. El patrón `'CODIGO: descripción'` es un contrato con el backend: en `backend/app/errores.py` una expresión regular toma lo que está antes de los dos puntos (`REPARTIDOR_NO_ASIGNADO`) como código de error estructurado, y lo de después como mensaje legible para el usuario. Por eso **todos** los `RAISE EXCEPTION` del proyecto siguen ese mismo formato.

También admite `%` como marcador de posición, como un `printf`:

```sql
RAISE EXCEPTION 'TRANSICION_INVALIDA: no se puede pasar del estado % al %', OLD.id_estado, NEW.id_estado;
```

Cada `%` se reemplaza en orden por los valores que vienen después de la coma.

### Loops: `FOR ... IN ... LOOP`

De `fn_crear_pedido`:

```sql
FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
LOOP
    v_id_producto := (v_item ->> 'id_producto')::INT;
    v_cantidad    := (v_item ->> 'cantidad')::INT;
    ...
    INSERT INTO detalle_pedido (...) VALUES (...);
END LOOP;
```

Recorre cada producto que vino en el pedido (una lista JSON desde el backend, ej. `[{"id_producto": 3, "cantidad": 2}]`) y hace un `INSERT` en `detalle_pedido` **por cada uno**. `jsonb_array_elements` descompone el array JSON en filas. `v_item ->> 'id_producto'` saca ese campo del JSON como texto, y `::INT` lo convierte a entero (eso se llama **cast**, aparece por todo el código).

### Funciones que llaman a otras funciones

```sql
SELECT * INTO v_cot
FROM fn_cotizar_pedido(p_id_cliente, p_id_restaurante, p_id_direccion, p_productos, p_propina, p_moneda);
```

`fn_crear_pedido` no vuelve a escribir la fórmula de cálculo del total — **reutiliza** `fn_cotizar_pedido` (la misma que usa el checkout para mostrar el resumen antes de pagar) y guarda todo el resultado en `v_cot` como un "registro" (`RECORD`) con varios campos (`v_cot.subtotal`, `v_cot.total`, etc.). Una sola fuente de verdad para la fórmula de precios.

## Parte 2 — Los triggers

Un trigger tiene **siempre dos partes**: la función que dice qué hacer, y el `CREATE TRIGGER` que dice cuándo dispararla.

### El trigger de validación de estados (el más importante del proyecto)

De `05_triggers_pedidos.sql`:

```sql
CREATE OR REPLACE FUNCTION fn_trg_validar_transicion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF (OLD.id_estado, NEW.id_estado) NOT IN (
        (1,2), (2,3), (3,4), (4,5), (1,6), (2,6), (3,6)
    ) THEN
        RAISE EXCEPTION 'TRANSICION_INVALIDA: no se puede pasar del estado % al %', OLD.id_estado, NEW.id_estado;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_transicion
    BEFORE UPDATE OF id_estado ON pedido
    FOR EACH ROW
    WHEN (OLD.id_estado IS DISTINCT FROM NEW.id_estado)
    EXECUTE FUNCTION fn_trg_validar_transicion();
```

- **`RETURNS TRIGGER`** — toda función que sirve de trigger devuelve el tipo especial `TRIGGER`.
- **`OLD` y `NEW`** — automáticos dentro de cualquier trigger. `OLD` es cómo estaba la fila **antes** del cambio, `NEW` es cómo va a quedar **después**.
- **`(OLD.id_estado, NEW.id_estado) NOT IN ((1,2), (2,3), ...)`** — arma un par de valores y lo compara contra una lista blanca de saltos permitidos. `(1,2)` significa "de recibido a en_preparación, sí se puede".
- **`RETURN NEW;`** — si todo está bien, el trigger devuelve `NEW` para que el `UPDATE` original siga su curso. Si se hubiera lanzado el `RAISE EXCEPTION` antes, nunca llega aquí — la transacción entera se cancela.
- **`BEFORE UPDATE OF id_estado ON pedido`** — se dispara **antes** de que el `UPDATE` toque la tabla, y solo cuando cambia `id_estado`.
- **`FOR EACH ROW`** — se ejecuta una vez por cada fila afectada.
- **`WHEN (OLD.id_estado IS DISTINCT FROM NEW.id_estado)`** — solo dispara si el valor realmente cambió.

**Pregunta típica**: "¿Por qué `BEFORE` y no `AFTER`?" — porque si fuera `AFTER`, el cambio inválido ya habría ocurrido en la tabla antes de que el trigger se diera cuenta. `BEFORE` frena el cambio antes de que pase.

### El otro patrón: generar efectos secundarios, no bloquear

De `06_pagos_calificaciones.sql`:

```sql
CREATE TRIGGER trg_actualizar_promedio
    AFTER INSERT ON calificacion
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_actualizar_promedio();
```

`AFTER INSERT`: deja que la calificación se guarde primero, y **después** recalcula el promedio. Regla general: **`BEFORE` para validar/bloquear, `AFTER` para reaccionar**.

### El trigger que avisa en tiempo real (`pg_notify`)

```sql
CREATE OR REPLACE FUNCTION fn_trg_notificar_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM pg_notify('canal_pedidos', json_build_object(
        'id_pedido', NEW.id_pedido,
        'id_estado', NEW.id_estado,
        ...
    )::text);
    RETURN NEW;
END;
$$;
```

- **`PERFORM`** — se usa en vez de `SELECT` cuando llamas a algo pero no te interesa guardar el resultado, solo que se ejecute.
- **`pg_notify(canal, mensaje)`** — como gritar un mensaje por un "canal de radio" de Postgres. El backend escucha ese canal (`LISTEN canal_pedidos`, en `backend/app/tiempo_real/listener.py`) y reenvía el mensaje a los navegadores por WebSocket. Así se actualiza sola la pantalla del coordinador.
- **`json_build_object(...)::text`** — arma un JSON a mano dentro de SQL; `::text` lo convierte a texto plano porque `pg_notify` solo acepta strings.

## Parte 3 — Cosas más avanzadas en las vistas

### Funciones de ventana: `LAG()`

De `vw_tiempos_por_etapa`:

```sql
LAG(h.fecha_hora) OVER (PARTITION BY h.id_pedido ORDER BY h.fecha_hora) AS fecha_anterior
```

`LAG` trae el valor de la fila anterior. `PARTITION BY h.id_pedido` quiere decir "calcula esto por separado para cada pedido". `ORDER BY h.fecha_hora` define qué es "anterior". Resultado: para cada cambio de estado, esta columna da la fecha del cambio justo antes, para restar y sacar cuántos minutos duró esa etapa.

### `ROW_NUMBER()` — rankings

De `vw_recomendaciones_cliente`:

```sql
ROW_NUMBER() OVER (PARTITION BY id_cliente ORDER BY veces_pedido DESC) AS ranking
```

Numera las filas 1, 2, 3... por cada cliente por separado, empezando por el producto que más pidió. El ranking 1 siempre es "lo que más pide ese cliente en particular".

### CTE (`WITH`) — una consulta con nombre

```sql
WITH transiciones AS (
    SELECT h.id_pedido, h.id_estado, LAG(...) AS estado_anterior, ...
    FROM historial_estado_pedido h JOIN pedido p ON ...
)
SELECT ... FROM pedido p JOIN transiciones t ON t.id_pedido = p.id_pedido ...
```

`WITH nombre AS (subconsulta)` le pone nombre a una subconsulta para usarla después como si fuera una tabla, en vez de anidar subconsultas ilegibles.

## Lo que ya sabías, pero aparece "disfrazado"

- `CHECK (total = subtotal + costo_envio + ...)` — restricción normal, solo que valida una fórmula matemática entre varias columnas de la misma fila.
- `FOR UPDATE SKIP LOCKED` en `fn_asignar_repartidor` — un `SELECT` normal con un extra: `FOR UPDATE` bloquea la fila elegida para que nadie más la toque hasta que termine la transacción; `SKIP LOCKED` dice "si ya está bloqueada por otra transacción, no esperes, sáltala y prueba con la siguiente". Responde a "¿cómo evitan que dos pedidos le ofrezcan el mismo repartidor al mismo tiempo?".
