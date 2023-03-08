CREATE TABLE public.users (
  username character varying(64) NOT NULL UNIQUE PRIMARY KEY,
  password character varying(256) NOT NULL,
  isAdmin BOOLEAN DEFAULT false
);

--Nota skal postgres gagnagrunn og setja upp a.m.k. þrjár töflur sem tengjast á einhvern máta.

--Nota skal viðeigandi virkni til að merkja dálka, t.d.
  -- Setja sem auðkenni (primary key).
  -- Merkja tengingar (foreign key).
  -- Merkja sem einstakt (unique).
  -- Merkja reiti sem viðeigandi gagnatag (strengir, tölur, dagsetningar, texti).
  -- Setja viðeigandi lengd á reiti.
  -- Í gagnagrunninn skal hlaða inn viðeigandi gögnum fyrir verkefnið, a.m.k. 20 færslur í heildina, a.m.k. lágmark fimm færslur per töflu.

CREATE TABLE public.xxx (

);

CREATE TABLE public.yyy (

);

CREATE TABLE public.zzz (

);

-- TODO: Muna að breyta nöfnum þegar búið að ákveða töflur