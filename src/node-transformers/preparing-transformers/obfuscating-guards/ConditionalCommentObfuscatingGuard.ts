import { injectable } from 'inversify';

import * as ESTree from 'estree';

import { IObfuscatingGuard } from '../../../interfaces/node-transformers/preparing-transformers/obfuscating-guards/IObfuscatingGuard';

import { NodeGuards } from '../../../node/NodeGuards';

@injectable()
export class ConditionalCommentObfuscatingGuard implements IObfuscatingGuard {
    /**
     * @type {RegExp}
     */
    private static readonly obfuscationEnableCommentRegExp: RegExp = new RegExp('javascript-obfuscator *: *enable');

    /**
     * @type {RegExp}
     */
    private static readonly obfuscationDisableCommentRegExp: RegExp = new RegExp('javascript-obfuscator *: *disable');

    /**
     * @type {boolean}
     */
    private obfuscationAllowed: boolean = true;

    /**
     * @param {Comment} comment
     * @returns {boolean}
     */
    public static isConditionalComment (comment: ESTree.Comment): boolean {
        return ConditionalCommentObfuscatingGuard.obfuscationEnableCommentRegExp.test(comment.value) ||
            ConditionalCommentObfuscatingGuard.obfuscationDisableCommentRegExp.test(comment.value);
    }

    /**
     * @returns {boolean}
     * @param node
     */
    public check (node: ESTree.Node): boolean {
        if (!NodeGuards.isNodeWithComments(node)) {
            return this.obfuscationAllowed;
        }

        const leadingComments: ESTree.Comment[] | undefined = node.leadingComments;

        if (leadingComments) {
            this.obfuscationAllowed = this.checkComments(leadingComments);
        }

        return this.obfuscationAllowed;
    }

    /**
     * @param {Comment[]} comments
     * @returns {boolean}
     */
    private checkComments (comments: ESTree.Comment[]): boolean {
        const commentsLength: number = comments.length;

        let obfuscationAllowed: boolean = this.obfuscationAllowed;

        for (let i: number = 0; i < commentsLength; i++) {
            const comment: ESTree.Comment = comments[i];

            if (ConditionalCommentObfuscatingGuard.obfuscationEnableCommentRegExp.test(comment.value)) {
                obfuscationAllowed = true;

                continue;
            }

            if (ConditionalCommentObfuscatingGuard.obfuscationDisableCommentRegExp.test(comment.value)) {
                obfuscationAllowed = false;
            }
        }

        return obfuscationAllowed;
    }
}
