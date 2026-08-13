USE [CuidarPlus]
GO

IF NOT EXISTS (SELECT 1 FROM GRUPOS_SANGUINEOS)
    INSERT INTO GRUPOS_SANGUINEOS (Tipo) VALUES ('O+'), ('A+'), ('B+'), ('AB+')
GO

IF NOT EXISTS (SELECT 1 FROM USUARIOS_TIPOS)
    INSERT INTO USUARIOS_TIPOS (Nombre) VALUES ('Paciente'), ('Cuidador')
GO

IF NOT EXISTS (SELECT 1 FROM ALERGIAS)
    INSERT INTO ALERGIAS (Descripcion) VALUES ('Sin alergias registradas')
GO

IF NOT EXISTS (SELECT 1 FROM CONDICIONES)
    INSERT INTO CONDICIONES (Tipo) VALUES ('Sin condicion registrada')
GO

IF NOT EXISTS (SELECT 1 FROM SEGUROS_MEDICOS)
    INSERT INTO SEGUROS_MEDICOS (Compania, Numero_poliza) VALUES ('Particular', 'SIN-POLIZA')
GO

IF NOT EXISTS (SELECT 1 FROM LABORATORIOS)
    INSERT INTO LABORATORIOS (Nombre, Telefono_unico) VALUES ('Laboratorio Demo', '0000-0000')
GO

IF NOT EXISTS (SELECT 1 FROM ESTADOS)
    INSERT INTO ESTADOS (Nombre) VALUES ('Bien'), ('Regular'), ('Mal')
GO

IF NOT EXISTS (SELECT 1 FROM MEDICOS)
    INSERT INTO MEDICOS (Nombre, Apellido, Matricula, Telefono_unico, Email)
    VALUES ('Medico', 'Demo', 'MP-0000', '0000-0000', 'medico.demo@cuidarplus.local')
GO

IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE Mail = 'demo@cuidarplus.local')
    INSERT INTO USUARIOS (Nombre, Apellido, Ciudad, Fecha_nacimiento, DNI, Mail, ID_grupo_sanguineo, ID_UsuarioTipo, ID_alergia, ID_condicion, ID_Seguro_medico, PasswordHash)
    VALUES ('Mateo', 'Demo', 'Cordoba', '1990-01-01', '00000000', 'demo@cuidarplus.local', 1, 1, 1, 1, 1, 'demo')
GO

IF NOT EXISTS (SELECT 1 FROM MEDICAMENTOS)
    INSERT INTO MEDICAMENTOS (Nombre, Descripcion, Presentacion, ID_laboratorio)
    VALUES ('Atorvastatina', 'Medicamento demo para pruebas del MVP', 'Comprimidos 20 mg', 1)
GO

IF NOT EXISTS (SELECT 1 FROM RECORDATORIOS)
    INSERT INTO RECORDATORIOS (Canal, FechaHoraProgramada)
    VALUES ('App', DATEADD(HOUR, 2, GETDATE()))
GO
