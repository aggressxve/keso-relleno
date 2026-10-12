-- Run once on an existing database after changing Empleado.rol to @ManyToOne.
-- Hibernate schema updates do not reliably remove the old @OneToOne unique index.
SET @has_role_index = (
    SELECT COUNT(DISTINCT index_name)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND LOWER(table_name) = 'empleados'
      AND column_name = 'id_rol'
      AND seq_in_index = 1
      AND non_unique = 1
);

SET @ddl = IF(
    @has_role_index = 0,
    'CREATE INDEX idx_empleados_id_rol ON Empleados (id_rol)',
    'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @unique_role_index = (
    SELECT index_name
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND LOWER(table_name) = 'empleados'
      AND non_unique = 0
      AND index_name <> 'PRIMARY'
    GROUP BY index_name
    HAVING COUNT(*) = 1 AND SUM(column_name = 'id_rol') = 1
    LIMIT 1
);

SET @ddl = IF(
    @unique_role_index IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE Empleados DROP INDEX `', REPLACE(@unique_role_index, '`', '``'), '`')
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
