
-- Insert test notifications
INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo, lida, link) VALUES 
('51b72f96-01f8-4fdb-8418-c39623f1767d', 'Licitação aprovada', 'A licitação PE 045/2025 foi aprovada com sucesso.', 'sucesso', false, '/licitacoes'),
('51b72f96-01f8-4fdb-8418-c39623f1767d', 'Documento vencendo', 'A CND Federal vence em 3 dias. Renove o quanto antes.', 'aviso', false, '/documentos'),
('51b72f96-01f8-4fdb-8418-c39623f1767d', 'Erro no envio', 'Falha ao enviar proposta para o ComprasNet.', 'erro', false, null),
('51b72f96-01f8-4fdb-8418-c39623f1767d', 'Nova tarefa atribuída', 'Você foi designado para montar documentação do PE 012/2025.', 'info', false, '/kanban');
