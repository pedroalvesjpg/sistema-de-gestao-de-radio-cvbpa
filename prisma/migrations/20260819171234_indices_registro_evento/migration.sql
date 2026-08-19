-- CreateIndex
CREATE INDEX "Evento_dataInicio_dataFim_idx" ON "Evento"("dataInicio", "dataFim");

-- CreateIndex
CREATE INDEX "Registro_radioId_idx" ON "Registro"("radioId");

-- CreateIndex
CREATE INDEX "Registro_eventoId_idx" ON "Registro"("eventoId");

-- CreateIndex
CREATE INDEX "Registro_recebedorId_idx" ON "Registro"("recebedorId");
