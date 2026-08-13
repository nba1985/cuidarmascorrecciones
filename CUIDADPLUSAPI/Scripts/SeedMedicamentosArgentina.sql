USE [CuidarPlus];
GO

SET NOCOUNT ON;

DECLARE @Laboratorios TABLE (
    Nombre varchar(100) NOT NULL,
    Telefono varchar(50) NULL
);

INSERT INTO @Laboratorios (Nombre, Telefono)
VALUES
('Generico', NULL),
('Bayer', NULL),
('Roemmers', NULL),
('Bago', NULL),
('Elea Phoenix', NULL),
('Gador', NULL),
('Raffo', NULL),
('Montpellier', NULL),
('Sanofi', NULL),
('Pfizer', NULL),
('Novartis', NULL),
('GlaxoSmithKline', NULL),
('AstraZeneca', NULL),
('Boehringer Ingelheim', NULL),
('Teva', NULL),
('Casasco', NULL),
('Bernabo', NULL),
('Investi', NULL);

INSERT INTO dbo.LABORATORIOS (Nombre, Telefono_unico)
SELECT l.Nombre, l.Telefono
FROM @Laboratorios AS l
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.LABORATORIOS AS lab
    WHERE lab.Nombre = l.Nombre
);

DECLARE @Medicamentos TABLE (
    Nombre varchar(100) NOT NULL,
    Descripcion varchar(255) NULL,
    Presentacion varchar(100) NULL,
    Laboratorio varchar(100) NOT NULL
);

INSERT INTO @Medicamentos (Nombre, Descripcion, Presentacion, Laboratorio)
VALUES
('Paracetamol', 'Analgesico y antifebril', 'Comprimidos 500 mg', 'Generico'),
('Tafirol', 'Paracetamol. Analgesico y antifebril', 'Comprimidos 500 mg', 'Bago'),
('Ibuprofeno', 'Antiinflamatorio y analgesico', 'Comprimidos 400 mg', 'Generico'),
('Actron', 'Ibuprofeno. Antiinflamatorio y analgesico', 'Capsulas blandas 400 mg', 'Bayer'),
('Diclofenac sodico', 'Antiinflamatorio y analgesico', 'Comprimidos 50 mg', 'Generico'),
('Aspirina', 'Acido acetilsalicilico. Analgesico y antiagregante', 'Comprimidos 100 mg', 'Bayer'),
('Amoxicilina', 'Antibiotico betalactamico', 'Capsulas 500 mg', 'Generico'),
('Amoxidal', 'Amoxicilina. Antibiotico betalactamico', 'Capsulas 500 mg', 'Roemmers'),
('Azitromicina', 'Antibiotico macrolido', 'Comprimidos 500 mg', 'Generico'),
('Cefalexina', 'Antibiotico cefalosporinico', 'Capsulas 500 mg', 'Generico'),
('Omeprazol', 'Inhibidor de la bomba de protones', 'Capsulas 20 mg', 'Generico'),
('Pantoprazol', 'Inhibidor de la bomba de protones', 'Comprimidos 40 mg', 'Generico'),
('Sertal', 'Antiespasmodico', 'Comprimidos', 'Roemmers'),
('Buscapina', 'Antiespasmodico abdominal', 'Comprimidos 10 mg', 'Boehringer Ingelheim'),
('Reliveran', 'Metoclopramida. Antiemetico', 'Comprimidos 10 mg', 'Investi'),
('Domperidona', 'Antiemetico y procinetico', 'Comprimidos 10 mg', 'Generico'),
('Loratadina', 'Antihistaminico', 'Comprimidos 10 mg', 'Generico'),
('Cetirizina', 'Antihistaminico', 'Comprimidos 10 mg', 'Generico'),
('Prednisona', 'Corticoide antiinflamatorio', 'Comprimidos 20 mg', 'Generico'),
('Dexametasona', 'Corticoide antiinflamatorio', 'Comprimidos 4 mg', 'Generico'),
('Salbutamol', 'Broncodilatador inhalatorio', 'Aerosol 100 mcg/dosis', 'GlaxoSmithKline'),
('Budesonida', 'Corticoide inhalatorio', 'Aerosol 200 mcg/dosis', 'AstraZeneca'),
('Losartan', 'Antihipertensivo antagonista de angiotensina II', 'Comprimidos 50 mg', 'Generico'),
('Enalapril', 'Antihipertensivo inhibidor ECA', 'Comprimidos 10 mg', 'Generico'),
('Amlodipina', 'Antihipertensivo bloqueante calcico', 'Comprimidos 5 mg', 'Generico'),
('Atenolol', 'Betabloqueante antihipertensivo', 'Comprimidos 50 mg', 'Generico'),
('Bisoprolol', 'Betabloqueante antihipertensivo', 'Comprimidos 5 mg', 'Generico'),
('Hidroclorotiazida', 'Diuretico antihipertensivo', 'Comprimidos 25 mg', 'Generico'),
('Furosemida', 'Diuretico de asa', 'Comprimidos 40 mg', 'Generico'),
('Metformina', 'Antidiabetico oral', 'Comprimidos 850 mg', 'Generico'),
('Glibenclamida', 'Antidiabetico oral sulfonilurea', 'Comprimidos 5 mg', 'Generico'),
('Insulina NPH', 'Insulina de accion intermedia', 'Lapicera inyectable 100 UI/ml', 'Sanofi'),
('Insulina regular', 'Insulina de accion rapida', 'Frasco ampolla 100 UI/ml', 'Sanofi'),
('Atorvastatina', 'Hipolipemiante estatina', 'Comprimidos 20 mg', 'Generico'),
('Rosuvastatina', 'Hipolipemiante estatina', 'Comprimidos 10 mg', 'Generico'),
('Simvastatina', 'Hipolipemiante estatina', 'Comprimidos 20 mg', 'Generico'),
('Clopidogrel', 'Antiagregante plaquetario', 'Comprimidos 75 mg', 'Generico'),
('Acenocumarol', 'Anticoagulante oral', 'Comprimidos 4 mg', 'Generico'),
('Levotiroxina', 'Hormona tiroidea', 'Comprimidos 100 mcg', 'Generico'),
('Alprazolam', 'Ansiolitico benzodiazepinico', 'Comprimidos 0,5 mg', 'Generico'),
('Clonazepam', 'Ansiolitico y anticonvulsivante', 'Comprimidos 0,5 mg', 'Generico'),
('Sertralina', 'Antidepresivo ISRS', 'Comprimidos 50 mg', 'Generico'),
('Fluoxetina', 'Antidepresivo ISRS', 'Capsulas 20 mg', 'Generico'),
('Escitalopram', 'Antidepresivo ISRS', 'Comprimidos 10 mg', 'Generico'),
('Tamsulosina', 'Tratamiento de sintomas urinarios por prostata', 'Capsulas 0,4 mg', 'Generico'),
('Finasteride', 'Tratamiento de hiperplasia prostatica', 'Comprimidos 5 mg', 'Generico'),
('Alendronato', 'Tratamiento de osteoporosis', 'Comprimidos 70 mg', 'Generico'),
('Calcio + Vitamina D', 'Suplemento de calcio y vitamina D', 'Comprimidos', 'Generico'),
('Sulfato ferroso', 'Suplemento de hierro', 'Comprimidos', 'Generico'),
('Acido folico', 'Suplemento vitaminico', 'Comprimidos 1 mg', 'Generico');

INSERT INTO dbo.MEDICAMENTOS (Nombre, Descripcion, Presentacion, ID_laboratorio)
SELECT m.Nombre, m.Descripcion, m.Presentacion, lab.ID_laboratorio
FROM @Medicamentos AS m
INNER JOIN dbo.LABORATORIOS AS lab ON lab.Nombre = m.Laboratorio
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.MEDICAMENTOS AS med
    WHERE med.Nombre = m.Nombre
      AND ISNULL(med.Presentacion, '') = ISNULL(m.Presentacion, '')
);

PRINT 'Seed de medicamentos finalizado.';
GO
