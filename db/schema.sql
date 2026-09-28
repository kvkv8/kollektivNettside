\restrict dbmate

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event (
    id bigint NOT NULL,
    title text NOT NULL,
    event_date date NOT NULL,
    start_time time without time zone,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT event_description_check CHECK ((length(description) <= 1000)),
    CONSTRAINT event_title_check CHECK (((length(btrim(title)) >= 1) AND (length(btrim(title)) <= 100)))
);


--
-- Name: event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.event ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote (
    id bigint NOT NULL,
    text text NOT NULL,
    speaker_id bigint NOT NULL,
    said_on date,
    context text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT quote_context_check CHECK ((length(context) <= 300)),
    CONSTRAINT quote_text_check CHECK (((length(btrim(text)) >= 1) AND (length(btrim(text)) <= 1000)))
);


--
-- Name: quote_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quote ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.quote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: site_password; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_password (
    id boolean DEFAULT true NOT NULL,
    password_hash text NOT NULL,
    password_version integer DEFAULT 1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_password_id_check CHECK (id)
);


--
-- Name: speaker; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.speaker (
    id bigint NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT speaker_name_check CHECK (((name = btrim(name)) AND ((length(name) >= 1) AND (length(name) <= 50))))
);


--
-- Name: speaker_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.speaker ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.speaker_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- Name: quote quote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote
    ADD CONSTRAINT quote_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: site_password site_password_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_password
    ADD CONSTRAINT site_password_pkey PRIMARY KEY (id);


--
-- Name: speaker speaker_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speaker
    ADD CONSTRAINT speaker_pkey PRIMARY KEY (id);


--
-- Name: event_upcoming_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_upcoming_idx ON public.event USING btree (event_date) WHERE (deleted_at IS NULL);


--
-- Name: quote_speaker_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_speaker_id_idx ON public.quote USING btree (speaker_id);


--
-- Name: speaker_name_lower_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX speaker_name_lower_key ON public.speaker USING btree (lower(name));


--
-- Name: quote quote_speaker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote
    ADD CONSTRAINT quote_speaker_id_fkey FOREIGN KEY (speaker_id) REFERENCES public.speaker(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260927200000');
