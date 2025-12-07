import { ChatInputCommandInteraction, LabelBuilder, MessageFlags, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { runCode } from "./run";

const executeChat = async (interaction: ChatInputCommandInteraction) => {
    const modal = new ModalBuilder().setCustomId('run-code').setTitle('Run Code Instantly!');

    // Source Code Language Input
    const langSelect = new StringSelectMenuBuilder()
        .setCustomId('language')
        .setPlaceholder('Pick a Programming Language!')
        .setRequired(true)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Go')
                .setValue('go')
                .setDefault(),
            new StringSelectMenuOptionBuilder()
                .setLabel('Python')
                .setValue('python')
        );
    const langSelectLabel = new LabelBuilder()
        .setLabel("Source Code Language")
        .setStringSelectMenuComponent(langSelect);

    // Source Code Input
    const sourcecodeInput = new TextInputBuilder()
        .setCustomId('source')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("//source-code");

    const sourcecodeInputLabel = new LabelBuilder()
        .setLabel("Source Code")
        .setTextInputComponent(sourcecodeInput)

    modal.addLabelComponents(langSelectLabel, sourcecodeInputLabel);

    await interaction.showModal(modal);
}


const executeModalSubmit = async (interaction: ModalSubmitInteraction) => {
    const sourceCode = interaction.fields.getTextInputValue('source');
    const language = interaction.fields.getStringSelectValues('language')[0];

    console.log(language);


    const sourceCodeHeadingC = new TextDisplayBuilder().setContent(
        '# Source Code'
    )
    const sourceCodeC = new TextDisplayBuilder().setContent(
        `\`\`\`${language}\n${sourceCode}\n\`\`\``
    );

    const { output } = await runCode(sourceCode, language!);

    const outputHeadingC = new TextDisplayBuilder().setContent(
        '# Output'
    )

    const outputC = new TextDisplayBuilder().setContent(
        `\`\`\`\n${output}\n\`\`\``
    );

    const replyC = [sourceCodeHeadingC, sourceCodeC, outputHeadingC, outputC]

    await interaction.reply({
        components: replyC,
        flags: MessageFlags.IsComponentsV2
    })
}

const data = new SlashCommandBuilder()
    .setName("run-code")
    .setDescription("Runs source code of the given programming language.")


export const runCodeCommand = {
    data, executeChat, executeModalSubmit
};