--
-- PostgreSQL database dump
--

\restrict NR1ARDxfWyrhTTjP3QPhGP8brTPPdQfTU22m2KjcbJfi5gn0e4jjwyaDWTfSTcE

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actividad; Type: TABLE; Schema: public; Owner: raul
--

CREATE TABLE public.actividad (
    idactividad integer NOT NULL,
    titulo character varying(150) NOT NULL,
    descripcion text,
    tipo character varying(50),
    fecha date,
    disponibilidad character varying(100),
    precio numeric(10,2),
    plazas integer,
    idofertante integer NOT NULL,
    horainicio time without time zone,
    horafin time without time zone
);


ALTER TABLE public.actividad OWNER TO raul;

--
-- Name: actividad_idactividad_seq; Type: SEQUENCE; Schema: public; Owner: raul
--

CREATE SEQUENCE public.actividad_idactividad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actividad_idactividad_seq OWNER TO raul;

--
-- Name: actividad_idactividad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raul
--

ALTER SEQUENCE public.actividad_idactividad_seq OWNED BY public.actividad.idactividad;


--
-- Name: consumidor; Type: TABLE; Schema: public; Owner: raul
--

CREATE TABLE public.consumidor (
    idusuario integer NOT NULL
);


ALTER TABLE public.consumidor OWNER TO raul;

--
-- Name: inscripcion; Type: TABLE; Schema: public; Owner: raul
--

CREATE TABLE public.inscripcion (
    idinscripcion integer NOT NULL,
    fechainscripcion date,
    idconsumidor integer NOT NULL,
    idactividad integer NOT NULL
);


ALTER TABLE public.inscripcion OWNER TO raul;

--
-- Name: inscripcion_idinscripcion_seq; Type: SEQUENCE; Schema: public; Owner: raul
--

CREATE SEQUENCE public.inscripcion_idinscripcion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inscripcion_idinscripcion_seq OWNER TO raul;

--
-- Name: inscripcion_idinscripcion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raul
--

ALTER SEQUENCE public.inscripcion_idinscripcion_seq OWNED BY public.inscripcion.idinscripcion;


--
-- Name: ofertante; Type: TABLE; Schema: public; Owner: raul
--

CREATE TABLE public.ofertante (
    idusuario integer NOT NULL
);


ALTER TABLE public.ofertante OWNER TO raul;

--
-- Name: usuario; Type: TABLE; Schema: public; Owner: raul
--

CREATE TABLE public.usuario (
    idusuario integer NOT NULL,
    nombre character varying(100),
    email character varying(150) NOT NULL,
    contrasena character varying(200) NOT NULL,
    tipousuario character varying(20) NOT NULL
);


ALTER TABLE public.usuario OWNER TO raul;

--
-- Name: usuario_idusuario_seq; Type: SEQUENCE; Schema: public; Owner: raul
--

CREATE SEQUENCE public.usuario_idusuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_idusuario_seq OWNER TO raul;

--
-- Name: usuario_idusuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raul
--

ALTER SEQUENCE public.usuario_idusuario_seq OWNED BY public.usuario.idusuario;


--
-- Name: actividad idactividad; Type: DEFAULT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.actividad ALTER COLUMN idactividad SET DEFAULT nextval('public.actividad_idactividad_seq'::regclass);


--
-- Name: inscripcion idinscripcion; Type: DEFAULT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.inscripcion ALTER COLUMN idinscripcion SET DEFAULT nextval('public.inscripcion_idinscripcion_seq'::regclass);


--
-- Name: usuario idusuario; Type: DEFAULT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.usuario ALTER COLUMN idusuario SET DEFAULT nextval('public.usuario_idusuario_seq'::regclass);


--
-- Data for Name: actividad; Type: TABLE DATA; Schema: public; Owner: raul
--

COPY public.actividad (idactividad, titulo, descripcion, tipo, fecha, disponibilidad, precio, plazas, idofertante, horainicio, horafin) FROM stdin;
1	Taller	asd	Visita al Real Alcázar de Sevilla	2025-12-11	abierta	10.07	27	1	12:03:00	12:44:00
5	Taller1	123	Ruta en bici por el río Guadalquivir	2025-12-12	abierta	123.00	12	1	12:12:00	12:34:00
\.


--
-- Data for Name: consumidor; Type: TABLE DATA; Schema: public; Owner: raul
--

COPY public.consumidor (idusuario) FROM stdin;
3
\.


--
-- Data for Name: inscripcion; Type: TABLE DATA; Schema: public; Owner: raul
--

COPY public.inscripcion (idinscripcion, fechainscripcion, idconsumidor, idactividad) FROM stdin;
44	2025-12-10	3	5
\.


--
-- Data for Name: ofertante; Type: TABLE DATA; Schema: public; Owner: raul
--

COPY public.ofertante (idusuario) FROM stdin;
1
2
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: raul
--

COPY public.usuario (idusuario, nombre, email, contrasena, tipousuario) FROM stdin;
1	Alice	alice@demo.com	$2b$10$YPuYt7hsJj4.0fOX0DkJUOIFVKAyx8YS3quFAA/ZZPcZXaj3OtZOi	ofertante
2	raul	raul@123.com	$2b$10$z63l71NjB5e2l8y6GD7/kO.SN0TaXBQGWFazAFDUi.k.vHpPx1MPm	ofertante
3	raul	123@123.com	$2b$10$/ts5TuoVqUg.JITgsoa21OV8AMHgJlK4uhANGGAMBGHBJvFYtg2/2	consumidor
\.


--
-- Name: actividad_idactividad_seq; Type: SEQUENCE SET; Schema: public; Owner: raul
--

SELECT pg_catalog.setval('public.actividad_idactividad_seq', 37, true);


--
-- Name: inscripcion_idinscripcion_seq; Type: SEQUENCE SET; Schema: public; Owner: raul
--

SELECT pg_catalog.setval('public.inscripcion_idinscripcion_seq', 45, true);


--
-- Name: usuario_idusuario_seq; Type: SEQUENCE SET; Schema: public; Owner: raul
--

SELECT pg_catalog.setval('public.usuario_idusuario_seq', 3, true);


--
-- Name: actividad actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_pkey PRIMARY KEY (idactividad);


--
-- Name: consumidor consumidor_pkey; Type: CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.consumidor
    ADD CONSTRAINT consumidor_pkey PRIMARY KEY (idusuario);


--
-- Name: inscripcion inscripcion_pkey; Type: CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.inscripcion
    ADD CONSTRAINT inscripcion_pkey PRIMARY KEY (idinscripcion);


--
-- Name: ofertante ofertante_pkey; Type: CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.ofertante
    ADD CONSTRAINT ofertante_pkey PRIMARY KEY (idusuario);


--
-- Name: inscripcion uq_inscripcion_unica; Type: CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.inscripcion
    ADD CONSTRAINT uq_inscripcion_unica UNIQUE (idconsumidor, idactividad);


--
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (idusuario);


--
-- Name: actividad fk_actividad_ofertante; Type: FK CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT fk_actividad_ofertante FOREIGN KEY (idofertante) REFERENCES public.ofertante(idusuario) ON DELETE CASCADE;


--
-- Name: consumidor fk_consumidor_usuario; Type: FK CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.consumidor
    ADD CONSTRAINT fk_consumidor_usuario FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario) ON DELETE CASCADE;


--
-- Name: inscripcion fk_inscripcion_actividad; Type: FK CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.inscripcion
    ADD CONSTRAINT fk_inscripcion_actividad FOREIGN KEY (idactividad) REFERENCES public.actividad(idactividad) ON DELETE CASCADE;


--
-- Name: inscripcion fk_inscripcion_consumidor; Type: FK CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.inscripcion
    ADD CONSTRAINT fk_inscripcion_consumidor FOREIGN KEY (idconsumidor) REFERENCES public.consumidor(idusuario) ON DELETE CASCADE;


--
-- Name: ofertante fk_ofertante_usuario; Type: FK CONSTRAINT; Schema: public; Owner: raul
--

ALTER TABLE ONLY public.ofertante
    ADD CONSTRAINT fk_ofertante_usuario FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO raulprueba;


--
-- Name: TABLE actividad; Type: ACL; Schema: public; Owner: raul
--

GRANT ALL ON TABLE public.actividad TO raulprueba;


--
-- Name: SEQUENCE actividad_idactividad_seq; Type: ACL; Schema: public; Owner: raul
--

GRANT ALL ON SEQUENCE public.actividad_idactividad_seq TO raulprueba;


--
-- Name: TABLE consumidor; Type: ACL; Schema: public; Owner: raul
--

GRANT ALL ON TABLE public.consumidor TO raulprueba;


--
-- Name: TABLE inscripcion; Type: ACL; Schema: public; Owner: raul
--

GRANT ALL ON TABLE public.inscripcion TO raulprueba;


--
-- Name: SEQUENCE inscripcion_idinscripcion_seq; Type: ACL; Schema: public; Owner: raul
--

GRANT ALL ON SEQUENCE public.inscripcion_idinscripcion_seq TO raulprueba;


--
-- Name: TABLE ofertante; Type: ACL; Schema: public; Owner: raul
--

GRANT ALL ON TABLE public.ofertante TO raulprueba;


--
-- Name: TABLE usuario; Type: ACL; Schema: public; Owner: raul
--

GRANT ALL ON TABLE public.usuario TO raulprueba;


--
-- Name: SEQUENCE usuario_idusuario_seq; Type: ACL; Schema: public; Owner: raul
--

GRANT ALL ON SEQUENCE public.usuario_idusuario_seq TO raulprueba;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: raul
--

ALTER DEFAULT PRIVILEGES FOR ROLE raul IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO raulprueba;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: raul
--

ALTER DEFAULT PRIVILEGES FOR ROLE raul IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO raulprueba;


--
-- PostgreSQL database dump complete
--

\unrestrict NR1ARDxfWyrhTTjP3QPhGP8brTPPdQfTU22m2KjcbJfi5gn0e4jjwyaDWTfSTcE

